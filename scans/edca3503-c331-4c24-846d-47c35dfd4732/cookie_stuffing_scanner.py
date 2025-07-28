import asyncio
import csv
import json
import os
from playwright.async_api import async_playwright
import smtplib
from email.message import EmailMessage
import zipfile
import io
from datetime import datetime


SUSPICIOUS_KEYWORDS = ["affiliate", "track", "click", "partner", "offer", "ref", "redirect"]

def is_suspicious(text):
    return any(word in text.lower() for word in SUSPICIOUS_KEYWORDS)

async def scan_url(page, url, screenshot_dir="screenshots"):
    detections = []

    page.on("request", lambda req: (
        detections.append({"type": "request",
        "url": page.url,
        "detail": req.url,
        "origin": req.frame.url if req.frame else "main",
        "referer": req.headers.get("referer", "None")}) if is_suspicious(req.url) else None
    ))

    async def handle_response(response):
        cookies = response.headers.get("set-cookie", "")
        url = response.url
        if cookies and is_suspicious(cookies):
            initiator = response.request.headers.get("referer", "No Referer")
            detections.append({
                "type": "cookie",
                "url": page.url,
                "detail": cookies,
                "origin": url,
                "referer": initiator
            })

    async def handle_response_v1(response):
        cookies = response.headers.get("set-cookie", "")
        url = response.url
        if cookies and is_suspicious(cookies):
            initiator = response.request.headers.get("referer", "No Referer")
            detections.append({
                "type": "cookie",
                "url": page.url,
                "detail": cookies,
                "origin": url,
                "referer": initiator
            })

    async def handle_response_v1(response):
        cookies = response.headers.get("set-cookie", "")
        if cookies and is_suspicious(cookies):
            detections.append({"type": "cookie", "url": url, "detail": cookies})
    page.on("response", handle_response)

    try:
        await page.goto(url, wait_until="networkidle", timeout=20000)
    except Exception as e:
        print(f"❌ Error loading {url}: {e}")
        return detections

    iframe_elements = await page.query_selector_all("iframe")
    for iframe in iframe_elements:
        try:
            src = await iframe.get_attribute("src") or ""
            visible = await page.evaluate('''(iframe) => {
                const rect = iframe.getBoundingClientRect();
                return !(iframe.offsetWidth <= 1 || iframe.offsetHeight <= 1 ||
                         getComputedStyle(iframe).display === "none" ||
                         getComputedStyle(iframe).visibility === "hidden");
            }''', iframe)
            if is_suspicious(src) and not visible:
                detections.append({"type": "iframe", "url": url, "detail": src})
        except Exception:
            continue

    # Save screenshot and HTML if suspicious content found
    if detections:
        os.makedirs(screenshot_dir, exist_ok=True)
        safe_name = url.replace("https://", "").replace("http://", "").replace("/", "_")
        try:
            await page.screenshot(path=f"{screenshot_dir}/{safe_name}.png", full_page=True)
            content = await page.content()
            with open(f"{screenshot_dir}/{safe_name}.html", "w", encoding="utf-8") as f:
                f.write(content)
            print(f"📸 Saved screenshot and HTML for: {url}")
        except Exception as e:
            print(f"⚠️ Failed to save screenshot for {url}: {e}")

    return detections


async def scan_url_v1(page, url):
    detections = []

    page.on("request", lambda req: (
        detections.append({"type": "request", "url": url, "detail": req.url}) if is_suspicious(req.url) else None
    ))

    async def handle_response(response):
        cookies = response.headers.get("set-cookie", "")
        if cookies and is_suspicious(cookies):
            detections.append({"type": "cookie", "url": url, "detail": cookies})
    page.on("response", handle_response)

    try:
        await page.goto(url, wait_until="networkidle", timeout=20000)
    except Exception as e:
        print(f"❌ Error loading {url}: {e}")
        return detections

    iframe_elements = await page.query_selector_all("iframe")
    for iframe in iframe_elements:
        try:
            src = await iframe.get_attribute("src") or ""
            visible = await page.evaluate('''(iframe) => {
                const rect = iframe.getBoundingClientRect();
                return !(iframe.offsetWidth <= 1 || iframe.offsetHeight <= 1 ||
                         getComputedStyle(iframe).display === "none" ||
                         getComputedStyle(iframe).visibility === "hidden");
            }''', iframe)
            if is_suspicious(src) and not visible:
                detections.append({"type": "iframe", "url": url, "detail": src})
        except Exception:
            continue
    return detections

async def run_batch_scan(urls):
    all_detections = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        context = await browser.new_context()
        page = await context.new_page()

        for url in urls:
            print(f"🔍 Scanning {url}")
            detections = await scan_url(page, url, screenshot_dir="screenshots")
            all_detections.extend(detections)
        await browser.close()
    return all_detections


async def run_batch_scan_v1(urls):
    all_detections = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        context = await browser.new_context()
        page = await context.new_page()

        for url in urls:
            print(f"🔍 Scanning {url}")
            detections = await scan_url(page, url)
            all_detections.extend(detections)
        await browser.close()
    return all_detections

def write_csv_report(detections, filename="cookie_stuffing_report.csv"):
    with open(filename, mode="w", newline="") as f:
        fieldnames = ["type", "url", "detail", "origin", "referer"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(detections)
    print(f"📄 Report saved to {filename}")


def write_csv_report_v1(detections, filename="cookie_stuffing_report.csv"):
    with open(filename, mode="w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["type", "url", "detail"])
        writer.writeheader()
        writer.writerows(detections)
    print(f"📄 Report saved to {filename}")

def send_email_alert(detections, recipient_email, smtp_config, zip_path=None):
    if not detections:
        return

    message = EmailMessage()
    message["Subject"] = "⚠️ Cookie Stuffing Detected!"
    message["From"] = smtp_config["sender"]
    message["To"] = recipient_email

    body = "Suspicious activity was detected on the following pages:\n\n"
    for det in detections:
        body += f"- [{det['type']}] {det['url']}\n    ↳ {det['detail']}\n"

    message.set_content(body)

    # Attach zipped screenshots
    if zip_path and os.path.exists(zip_path):
        with open(zip_path, "rb") as f:
            message.add_attachment(
                f.read(),
                maintype="application",
                subtype="zip",
                filename=os.path.basename(zip_path)
            )
        print(f"📎 Attached {zip_path} to email.")

    with smtplib.SMTP_SSL(smtp_config["server"], smtp_config["port"]) as smtp:
        smtp.login(smtp_config["sender"], smtp_config["password"])
        smtp.send_message(message)
        print("📧 Alert email sent.")

    # Cleanup
    if zip_path and os.path.exists(zip_path):
        os.remove(zip_path)
        print(f"🧹 Deleted zip file: {zip_path}")



def log_scan_history(detections, urls, log_file="scan_history.csv"):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    detected_urls = {d['url'] for d in detections}

    with open(log_file, mode="a", newline="") as f:
        writer = csv.writer(f)
        if f.tell() == 0:
            writer.writerow(["timestamp", "url", "status"])

        for url in urls:
            status = "DETECTED" if url in detected_urls else "CLEAN"
            writer.writerow([timestamp, url, status])


def send_email_alert_v1(detections, recipient_email, smtp_config):
    if not detections:
        return
    message = EmailMessage()
    message["Subject"] = "⚠️ Cookie Stuffing Detected!"
    message["From"] = smtp_config["sender"]
    message["To"] = recipient_email

    body = "Suspicious activity was detected on the following pages:\n\n"
    for det in detections:
        body += f"- [{det['type']}] {det['url']}\n    ↳ {det['detail']}\n"

    message.set_content(body)

    with smtplib.SMTP_SSL(smtp_config["server"], smtp_config["port"]) as smtp:
        smtp.login(smtp_config["sender"], smtp_config["password"])
        smtp.send_message(message)
        print("📧 Alert email sent.")

def zip_screenshots_folder(folder_path="screenshots", zip_path="screenshots.zip"):
    if not os.path.exists(folder_path):
        return None

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(folder_path):
            for file in files:
                full_path = os.path.join(root, file)
                arcname = os.path.relpath(full_path, folder_path)
                zipf.write(full_path, arcname)
    return zip_path




# 🔁 Entry point
async def main():
    if not os.path.exists("urls.txt"):
        print("❌ urls.txt not found!")
        return

    with open("urls.txt") as f:
        urls = [line.strip() for line in f if line.strip()]

    detections = await run_batch_scan(urls)
    write_csv_report(detections)

    # Optional: Send email if anything was found
    if detections:
        zip_path = zip_screenshots_folder()
        send_email_alert(
            detections,
            recipient_email="adfraudfighter@gmail.com",
            smtp_config={
                "server": "smtpout.secureserver.net",
                "port": 465,
                "sender": "alerts@brandpatrol.ai",
                "password": "d.4_c6BbBWpe$JR"
            },
            zip_path=zip_path
        )
    log_scan_history(detections, urls)


async def main_v1():
    if not os.path.exists("urls.txt"):
        print("❌ urls.txt not found!")
        return

    with open("urls.txt") as f:
        urls = [line.strip() for line in f if line.strip()]

    detections = await run_batch_scan(urls)
    write_csv_report(detections)

    # Optional: Send email if anything was found
    if detections:
        send_email_alert(
            detections,
            recipient_email="you@example.com",
            smtp_config={
                "server": "smtp.gmail.com",
                "port": 465,
                "sender": "your-email@gmail.com",
                "password": "your-app-password"  # Use an app password if using Gmail
            }
        )

if __name__ == "__main__":
    asyncio.run(main())

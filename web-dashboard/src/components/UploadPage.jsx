import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Upload, FileText, Link, ArrowLeft, Scan, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export function UploadPage({ onBack, onStartScan }) {
  const [urls, setUrls] = useState('');
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && uploadedFile.type === 'text/plain') {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUrls(e.target.result);
      };
      reader.readAsText(uploadedFile);
      toast({
        title: "File uploaded successfully!",
        description: "URLs have been loaded from your file.",
      });
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt file containing URLs.",
        variant: "destructive",
      });
    }
  };

  const handleStartScan = () => {
    const urlList = urls.trim().split('\n').filter(url => url.trim());
    
    if (urlList.length === 0) {
      toast({
        title: "No URLs provided",
        description: "Please add at least one URL to scan.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    toast({
      title: "Scan started...",
      description: `Analyzing ${urlList.length} URLs for security threats.`,
    });

    // Simulate scan process
    setTimeout(() => {
      setIsScanning(false);
      onStartScan(urlList);
    }, 2000);
  };

  return (
    <>
      <Helmet>
        <title>Upload URLs - Attribution Guard</title>
        <meta name="description" content="Submit URLs for comprehensive security scanning and threat detection analysis." />
      </Helmet>
      
      <div className="min-h-screen p-4 flex flex-col">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </motion.div>

        <div className="max-w-4xl mx-auto w-full">
          {/* Title */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Submit URLs for Security Scan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your URLs to detect affiliate fraud, cookie stuffing, and other security threats
            </p>
          </motion.div>

          {/* Upload Options */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Manual URL Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5 text-primary" />
                    Manual URL Entry
                  </CardTitle>
                  <CardDescription>
                    Paste your URLs directly, one per line
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="https://example.com/affiliate-link&#10;https://another-site.com/tracking&#10;https://partner-site.com/campaign"
                    value={urls}
                    onChange={(e) => setUrls(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    Enter one URL per line
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* File Upload */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="h-full border-2 hover:border-secondary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-secondary" />
                    File Upload
                  </CardTitle>
                  <CardDescription>
                    Upload a .txt file containing your URLs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-secondary/50 transition-colors">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <Input
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer"
                    >
                      <Button variant="outline" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                    {file && (
                      <p className="mt-2 text-sm text-green-400">
                        ✓ {file.name} uploaded
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports .txt files only
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* URL Preview */}
          {urls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">URLs to Scan</CardTitle>
                  <CardDescription>
                    {urls.trim().split('\n').filter(url => url.trim()).length} URLs ready for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4 max-h-32 overflow-y-auto">
                    {urls.trim().split('\n').filter(url => url.trim()).map((url, index) => (
                      <div key={index} className="text-sm font-mono text-muted-foreground py-1">
                        {index + 1}. {url}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Start Scan Button */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              onClick={handleStartScan}
              disabled={isScanning || !urls.trim()}
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground px-12 py-4 text-lg font-semibold rounded-full shadow-2xl"
            >
              {isScanning ? (
                <>
                  <motion.div
                    className="mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Scan className="h-5 w-5" />
                  </motion.div>
                  Scanning...
                </>
              ) : (
                <>
                  <Scan className="mr-2 h-5 w-5" />
                  Start Scan
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
/**
 * =================================================================
 * Author: Awais Nazeer (ZRR Gujjar)
 * Email: awaisnazeer07@gmail.com
 * =================================================================
 * Bakery OCR System - Frontend React Application
 * =================================================================
 */

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DataObjectIcon from '@mui/icons-material/DataObject';
import TableChartIcon from '@mui/icons-material/TableChart';
import CakeIcon from '@mui/icons-material/Cake';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import cupcakeBackground from './assets/cupcake-pattern.png';
import bakeryHero from './assets/bakery-hero.jpg';

// Styled components
const DropzoneBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  borderStyle: 'dashed',
  borderWidth: 2,
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.secondary,
  transition: 'border .3s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 200,
}));

const PreviewContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  textAlign: 'center',
  maxHeight: '300px',
  overflow: 'hidden',
}));

const PreviewImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
});

const JsonDisplay = styled('pre')(({ theme }) => ({
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  overflow: 'auto',
  maxHeight: '400px',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  padding: theme.spacing(6, 0),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(4),
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
}));

const PatternBackground = styled(Box)(({ theme }) => ({
  backgroundImage: `url(${cupcakeBackground})`,
  backgroundSize: '200px',
  backgroundRepeat: 'repeat',
  backgroundAttachment: 'fixed',
  opacity: 0.05,
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px -10px rgba(141, 110, 99, 0.4)',
  },
}));

const LogoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
}));

const Logo = styled('img')({
  width: 80,
  height: 80,
});

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('table');
  const [alertOpen, setAlertOpen] = useState(false);
  const [processingMode, setProcessingMode] = useState('auto');

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const handleDrop = acceptedFiles => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload an image file');
        setAlertOpen(true);
        return;
      }
      
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      setExtractedData(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  });

  const handleExtract = async () => {
    if (!file) {
      setError('Please upload an image first');
      setAlertOpen(true);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', processingMode);

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setExtractedData(response.data.data);
      } else {
        setError(response.data.error || 'Failed to extract data from image');
        setAlertOpen(true);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing the image');
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = () => {
    if (!extractedData) return;
    
    const jsonString = JSON.stringify(extractedData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bakery_items.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PatternBackground />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <HeaderBox>
          <Container>
            <Box textAlign="center">
              <LogoBox>
                <Logo src="/logo192.png" alt="Bakery OCR Logo" />
              </LogoBox>
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                Bakery Items OCR Tool
              </Typography>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Upload images of your bakery item tables and instantly convert them to structured data
              </Typography>
              <Chip 
                icon={<TableChartIcon />} 
                label="Table Recognition" 
                color="secondary" 
                sx={{ mr: 1 }} 
              />
              <Chip 
                icon={<DataObjectIcon />} 
                label="JSON Export" 
                color="secondary" 
                variant="outlined" 
              />
            </Box>
          </Container>
        </HeaderBox>

        {/* Features Section */}
        <Box mb={6}>
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
            Features
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FeatureCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                      <CloudUploadIcon sx={{ fontSize: 35 }} />
                    </Avatar>
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom align="center">
                    Easy Upload
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Simply drag and drop your bakery item tables or click to select files.
                    Supports JPG, PNG, and other common image formats.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 60, height: 60 }}>
                      <TableChartIcon sx={{ fontSize: 35 }} />
                    </Avatar>
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom align="center">
                    Smart Recognition
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Advanced OCR technology extracts data from both tabular and non-tabular formats
                    with high accuracy.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                      <DataObjectIcon sx={{ fontSize: 35 }} />
                    </Avatar>
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom align="center">
                    JSON Export
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Download extracted data in JSON format for seamless integration with your
                    bakery management systems.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          </Grid>
        </Box>

        {/* Main Tool Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Upload Bakery Document
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="body1" paragraph>
              Upload an image containing your bakery items information. Our system will extract the data and convert it to structured format.
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Processing Mode:
              </Typography>
              <Box display="flex" gap={1}>
                <Chip 
                  label="Auto Detect" 
                  icon={<RestaurantMenuIcon />} 
                  color={processingMode === 'auto' ? 'primary' : 'default'}
                  variant={processingMode === 'auto' ? 'filled' : 'outlined'}
                  onClick={() => setProcessingMode('auto')}
                  clickable
                />
                <Chip 
                  label="Table Format" 
                  icon={<TableChartIcon />} 
                  color={processingMode === 'table' ? 'primary' : 'default'}
                  variant={processingMode === 'table' ? 'filled' : 'outlined'}
                  onClick={() => setProcessingMode('table')}
                  clickable
                />
                <Chip 
                  label="General Text" 
                  icon={<InsertDriveFileIcon />}
                  color={processingMode === 'text' ? 'primary' : 'default'}
                  variant={processingMode === 'text' ? 'filled' : 'outlined'}
                  onClick={() => setProcessingMode('text')}
                  clickable
                />
              </Box>
            </Box>
            
            <DropzoneBox {...getRootProps()}>
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
              {isDragActive ? (
                <Typography>Drop the image here...</Typography>
              ) : (
                <Typography>Drag and drop an image here, or click to select a file</Typography>
              )}
              <Typography variant="caption" sx={{ mt: 1 }}>
                Supports JPG, PNG, GIF
              </Typography>
            </DropzoneBox>
            
            {preview && (
              <PreviewContainer>
                <Typography variant="subtitle1" gutterBottom>
                  Preview:
                </Typography>
                <PreviewImage src={preview} alt="Preview" />
              </PreviewContainer>
            )}
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleExtract}
              disabled={!file || loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TableChartIcon />}
              sx={{ mt: 2 }}
            >
              {loading ? 'Extracting Data...' : 'Extract Bakery Data'}
            </Button>
          </CardContent>
        </Card>

        {extractedData && (
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Grid container>
                <Grid item xs={6}>
                  <Button 
                    fullWidth
                    onClick={() => setActiveTab('table')}
                    color={activeTab === 'table' ? 'primary' : 'inherit'}
                    sx={{ py: 2, borderBottom: activeTab === 'table' ? 2 : 0, borderColor: 'primary.main' }}
                    startIcon={<TableChartIcon />}
                  >
                    Table View
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button 
                    fullWidth
                    onClick={() => setActiveTab('json')}
                    color={activeTab === 'json' ? 'primary' : 'inherit'}
                    sx={{ py: 2, borderBottom: activeTab === 'json' ? 2 : 0, borderColor: 'primary.main' }}
                    startIcon={<DataObjectIcon />}
                  >
                    JSON View
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            <CardContent>
              {activeTab === 'table' ? (
                <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {extractedData.header && extractedData.header.map((column, index) => (
                          <TableCell key={index} sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' }}>{column}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {extractedData.data && extractedData.data.map((row, rowIndex) => (
                        <TableRow 
                          key={rowIndex} 
                          hover
                          sx={{ '&:nth-of-type(odd)': { bgcolor: 'background.default' } }}
                        >
                          {extractedData.header.map((column, colIndex) => (
                            <TableCell key={colIndex}>{row[column] || ''}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box>
                  <JsonDisplay>
                    {JSON.stringify(extractedData, null, 2)}
                  </JsonDisplay>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<DataObjectIcon />}
                    onClick={downloadJson}
                    sx={{ mt: 2 }}
                  >
                    Download JSON
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <Box sx={{ mt: 8, pt: 3, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Bakery OCR System by Awais Nazeer (ZRR Gujjar)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <a href="mailto:awaisnazeer07@gmail.com" style={{ color: 'inherit', textDecoration: 'underline' }}>
              awaisnazeer07@gmail.com
            </a>
          </Typography>
        </Box>

        <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}

export default App; 
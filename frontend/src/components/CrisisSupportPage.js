import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  SvgIcon,
  Card,
  CardContent,
  Container,
  Divider,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  CardActions,
  Chip,
  DialogContentText,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom red icon for crisis markers
const crisisIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom blue icon for user's location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const CrisisSupportPage = () => {
  const navigate = useNavigate();
  const [isCrisis, setIsCrisis] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [hasConsent, setHasConsent] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [crisisCenters, setCrisisCenters] = useState([]);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [mapKey, setMapKey] = useState(0); // Force re-render of map
  const [locationError, setLocationError] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [shareLocationDialogOpen, setShareLocationDialogOpen] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState('');
  const user = auth.currentUser;

  // Mock crisis center data - in a real app, this would come from a geocoding API
  const mockCrisisCenters = [
    {
      name: "National Crisis Center",
      lat: 40.7128,
      lng: -74.0060,
      address: "123 Crisis St, New York, NY",
      phone: "212-555-1234",
      distance: "1.2 miles"
    },
    {
      name: "Community Mental Health Center",
      lat: 40.7138,
      lng: -74.0070,
      address: "456 Support Ave, New York, NY",
      phone: "212-555-5678",
      distance: "1.5 miles"
    },
    {
      name: "Emergency Support Services",
      lat: 40.7118,
      lng: -74.0050,
      address: "789 Help Blvd, New York, NY",
      phone: "212-555-9012",
      distance: "2.0 miles"
    }
  ];

  // Mock hospital data
  const mockHospitals = [
    {
      name: "City General Hospital",
      lat: 40.7148,
      lng: -74.0080,
      address: "321 Medical Plaza, New York, NY",
      phone: "212-555-3456",
      distance: "1.8 miles"
    },
    {
      name: "Regional Medical Center",
      lat: 40.7108,
      lng: -74.0040,
      address: "654 Health Way, New York, NY",
      phone: "212-555-7890",
      distance: "2.3 miles"
    }
  ];

  useEffect(() => {
    if (hasConsent && !userLocation) {
      getUserLocation();
    }
  }, [hasConsent]);

  // Function to get user's current location
  const getUserLocation = () => {
    setIsLocationLoading(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setCrisisCenters(mockCrisisCenters);
        setNearbyHospitals(mockHospitals);
        setIsLocationLoading(false);
      },
      (error) => {
        console.error("Error getting location", error);
        setLocationError("Unable to get your location. Please enable location services.");
        setIsLocationLoading(false);
      }
    );
  };

  // Function to handle emergency call with location sharing
  const handleEmergencyCall = async (center) => {
    if (!user) {
      setIsSaved(true);
      return;
    }
    
    try {
      // Create crisis event document
      const crisisEvent = {
        type: 'emergency_call',
        center: center,
        userLocation: userLocation,
        timestamp: new Date().toISOString(),
        acknowledged: false
      };
      
      const crisisEventRef = await addDoc(collection(db, 'users', user.uid, 'crisis_events'), crisisEvent);
      
      // Update the crisis event with the emergency contact if provided
      if (emergencyContact) {
        await updateDoc(doc(db, 'users', user.uid, 'crisis_events', crisisEventRef.id), {
          emergencyContact: emergencyContact,
          locationShared: true
        });
      }
      
      // Open phone dialer with the center's phone number
      window.open(`tel:${center.phone}`, '_self');
    } catch (error) {
      console.error('Error creating crisis event:', error);
      // Still open the phone dialer even if logging fails
      window.open(`tel:${center.phone}`, '_self');
    }
  };

  // Function to share location with emergency contact
  const handleShareLocation = () => {
    setShareLocationDialogOpen(true);
  };

  // Function to confirm location sharing
  const handleConfirmLocationSharing = async () => {
    if (!user || !userLocation) {
      setShareLocationDialogOpen(false);
      return;
    }
    
    try {
      // Create location sharing event
      const locationShare = {
        type: 'location_share',
        userLocation: userLocation,
        timestamp: new Date().toISOString(),
        acknowledged: false
      };
      
      await addDoc(collection(db, 'users', user.uid, 'crisis_events'), locationShare);
      
      setShareLocationDialogOpen(false);
      setEmergencyContact('');
    } catch (error) {
      console.error('Error sharing location:', error);
      setShareLocationDialogOpen(false);
      setEmergencyContact('');
    }
  };

  // Function to open Google Maps with directions
  const openGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Component to handle map click events
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        // In a real app, you might want to handle map clicks here
        // For example, to add markers or perform other actions
      }
    });
    return null;
  };

  const crisisResources = [
    {
      title: 'National Suicide Prevention Lifeline',
      description: 'Free, 24/7 confidential support for people in distress',
      number: '988',
      type: 'hotline',
      severity: 'immediate',
    },
    {
      title: 'Crisis Text Line',
      description: 'Text HOME to 741741 from anywhere in the US, anytime',
      number: '741741',
      type: 'text',
      severity: 'immediate',
    },
    {
      title: 'NAMI Helpline',
      description: 'Information and referral service for mental health',
      number: '1-800-950-NAMI',
      type: 'hotline',
      severity: 'high',
    },
    {
      title: 'SAMHSA National Helpline',
      description: 'Free, confidential, 24/7 treatment referral service',
      number: '1-800-662-HELP',
      type: 'hotline',
      severity: 'medium',
    },
  ];

  const handleCall = (number) => {
    if (typeof window !== 'undefined' && window.PhoneNumber) {
      window.PhoneNumber.dial(number);
    } else {
      window.open(`tel:${number}`, '_self');
    }
  };

  const handleText = (number) => {
    if (typeof window !== 'undefined' && window.Messaging) {
      window.Messaging.openConversation(number);
    } else {
      window.open(`sms:${number}?body=Hi, I need help with a mental health crisis`);
    }
  };

  const handleSubmitCrisis = async () => {
    if (!user) {
      setIsSaved(true);
      return;
    }
    
    try {
      await addDoc(collection(db, 'users', user.uid, 'crisis_events'), {
        resource: selectedResource,
        timestamp: new Date().toISOString(),
        acknowledged: true
      });
      setIsSaved(true);
      
      // Redirect to emergency services if in immediate crisis
      if (isCrisis) {
        window.location.href = 'tel:911';
      }
    } catch (error) {
      console.error('Error saving crisis event:', error);
      setIsSaved(true); // Still mark as saved even if logging fails
    }
  };

  if (isSaved) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Thank You for Reaching Out
        </Typography>
        <Typography variant="body1" color="#4c9a73">
          Your well-being is important. Remember, you are not alone in this.
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/')} 
          sx={{ mt: 3 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom color="#0d1b14">
          Crisis Support
        </Typography>
        
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Crisis Help</AlertTitle>
          If you are in immediate danger, please call 911 or go to the nearest emergency room.
        </Alert>

        {!hasConsent ? (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="#0d1b14">
                Are you experiencing immediate thoughts of harming yourself?
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => { setIsCrisis(true); setHasConsent(true); }}
                  sx={{
                    bgcolor: '#f44336',
                    '&:hover': { bgcolor: '#d32f2f' },
                    borderRadius: '8px'
                  }}
                >
                  Yes, I'm in immediate crisis
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => setHasConsent(true)}
                  sx={{
                    borderRadius: '8px'
                  }}
                >
                  No, I need resources
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <>
            {isCrisis && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom color="#d32f2f">
                    Emergency Resources
                  </Typography>
                  <List>
                    {crisisResources
                      .filter(resource => resource.severity === 'immediate')
                      .map((resource, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <SvgIcon sx={{ color: '#f44336' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                              <path d="M0 0h24v24H0z" fill="none" />
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                            </svg>
                          </SvgIcon>
                        </ListItemIcon>
                        <ListItemText 
                          primary={resource.title} 
                          secondary={resource.description} 
                        />
                        {resource.type === 'hotline' ? (
                          <Button 
                            onClick={() => handleCall(resource.number)}
                            variant="contained"
                            color="error"
                          >
                            Call
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleText(resource.number)}
                            variant="contained"
                          >
                            Text
                          </Button>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

            {userLocation && (
              <Card sx={{ mb: 3 }}>
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Typography variant="h6" color="#0d1b14">
                    Your Location
                  </Typography>
                  <Button 
                    variant="outlined"
                    onClick={handleShareLocation}
                    startIcon={
                      <SvgIcon fontSize="small">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                          <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                        </svg>
                      </SvgIcon>
                    }
                  >
                    Share Location
                  </Button>
                </CardActions>
                <CardContent sx={{ pt: 0 }}>
                  <Box sx={{ height: 300, mb: 2 }}>
                    <MapContainer 
                      center={[userLocation.lat, userLocation.lng]} 
                      zoom={13} 
                      key={mapKey}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <MapClickHandler />
                      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                        <Popup>
                          <Typography variant="body2">Your Location</Typography>
                        </Popup>
                      </Marker>
                      
                      {/* Crisis Centers */}
                      {crisisCenters.map((center, index) => (
                        <Marker key={index} position={[center.lat, center.lng]} icon={crisisIcon}>
                          <Popup>
                            <Typography variant="h6">{center.name}</Typography>
                            <Typography variant="body2">{center.address}</Typography>
                            <Typography variant="body2">Distance: {center.distance}</Typography>
                            <Button 
                              variant="contained" 
                              color="error" 
                              size="small"
                              onClick={() => handleEmergencyCall(center)}
                              sx={{ mt: 1 }}
                            >
                              Call for Help
                            </Button>
                          </Popup>
                        </Marker>
                      ))}
                      
                      {/* Hospitals */}
                      {nearbyHospitals.map((hospital, index) => (
                        <Marker key={index} position={[hospital.lat, hospital.lng]} icon={userIcon}>
                          <Popup>
                            <Typography variant="h6">{hospital.name}</Typography>
                            <Typography variant="body2">{hospital.address}</Typography>
                            <Typography variant="body2">Distance: {hospital.distance}</Typography>
                            <Button 
                              variant="contained" 
                              size="small"
                              onClick={() => handleEmergencyCall(hospital)}
                              sx={{ mt: 1 }}
                            >
                              Directions
                            </Button>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </Box>

                  {locationError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {locationError}
                    </Alert>
                  )}

                  {isLocationLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <CircularProgress />
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="Emergency Resources" />
                <Tab label="Crisis Centers" disabled={!userLocation} />
                <Tab label="Nearby Hospitals" disabled={!userLocation} />
              </Tabs>
            </Box>

            <Box>
              <AnimatePresence mode="wait">
                {activeTab === 0 && (
                  <motion.div
                    key="emergency"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent>
                        <Typography variant="h5" gutterBottom color="#0d1b14">
                          Additional Resources
                        </Typography>
                        <List>
                          {crisisResources
                            .filter(resource => resource.severity !== 'immediate')
                            .map((resource, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <SvgIcon sx={{ color: '#4c9a73' }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                    <path d="M0 0h24v24H0z" fill="none" />
                                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                                  </svg>
                                </SvgIcon>
                              </ListItemIcon>
                              <ListItemText 
                                primary={resource.title} 
                                secondary={`${resource.number} - ${resource.description}`} 
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 1 && userLocation && (
                  <motion.div
                    key="crisis"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent>
                        <Typography variant="h5" gutterBottom color="#0d1b14">
                          Nearby Crisis Centers
                        </Typography>
                        <List>
                          {crisisCenters.map((center, index) => (
                            <ListItem key={index}>
                              <ListItemText 
                                primary={center.name}
                                secondary={`${center.address} • ${center.distance}`}
                              />
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Typography variant="body2" color="#4c9a73">{center.phone}</Typography>
                                <Button 
                                  variant="contained" 
                                  color="error" 
                                  size="small"
                                  onClick={() => handleEmergencyCall(center)}
                                  sx={{ mt: 1 }}
                                >
                                  Call for Help
                                </Button>
                              </Box>
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 2 && userLocation && (
                  <motion.div
                    key="hospitals"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent>
                        <Typography variant="h5" gutterBottom color="#0d1b14">
                          Nearby Hospitals
                        </Typography>
                        <List>
                          {nearbyHospitals.map((hospital, index) => (
                            <ListItem key={index}>
                              <ListItemText 
                                primary={hospital.name}
                                secondary={`${hospital.address} • ${hospital.distance}`}
                              />
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Typography variant="body2" color="#4c9a73">{hospital.phone}</Typography>
                                <Button 
                                  variant="contained" 
                                  size="small"
                                  onClick={() => handleEmergencyCall(hospital)}
                                  sx={{ mt: 1 }}
                                >
                                  Get Directions
                                </Button>
                              </Box>
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="#4c9a73" paragraph>
                Thank you for reaching out for help. These resources are available 24/7.
              </Typography>
              <Button 
                onClick={() => navigate('/')}
                variant="outlined"
                sx={{ borderRadius: '8px', mr: 2 }}
              >
                Back to Dashboard
              </Button>
              <Button 
                onClick={handleSubmitCrisis}
                variant="contained"
                sx={{
                  bgcolor: '#4c9a73',
                  '&:hover': { bgcolor: '#3a9b7a' },
                  borderRadius: '8px'
                }}
              >
                I've received help
              </Button>
            </Box>
          </>
        )}

        {/* Share Location Dialog */}
        <Dialog
          open={shareLocationDialogOpen}
          onClose={() => setShareLocationDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Share Your Location</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Share your location with emergency contacts so they can find you if needed.
              Your location will only be shared in case of an emergency.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Emergency Contact Phone"
              fullWidth
              variant="outlined"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareLocationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmLocationSharing} variant="contained">
              Share Location
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default CrisisSupportPage;
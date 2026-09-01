export const geocodeLocation = async (locationStr) => {
  // Default to Matara, Sri Lanka coordinates with slight random jitter
  let lat = 6.0725 + (Math.random() - 0.5) * 0.01;
  let lon = 80.5750 + (Math.random() - 0.5) * 0.01;

  if (!locationStr) return { latitude: lat, longitude: lon };

  try {
    // Adding Sri Lanka to improve local search accuracy
    const query = encodeURIComponent(`${locationStr}, Sri Lanka`);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        // Add a very slight jitter to avoid exact overlapping pins
        lat = parseFloat(data[0].lat) + (Math.random() - 0.5) * 0.002;
        lon = parseFloat(data[0].lon) + (Math.random() - 0.5) * 0.002;
      }
    }
  } catch (err) {
    console.error('Geocoding error:', err);
  }

  return { latitude: lat, longitude: lon };
};

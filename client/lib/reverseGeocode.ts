export async function reverseGeocode(
  latitude: number | null,
  longitude: number | null
): Promise<string> {
  if (latitude === null || longitude === null) {
    return 'Location not available';
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SmartDELHI/1.0',
        },
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      return 'Location unavailable';
    }

    const data = await response.json();

    const address = data.address || {};

    const area =
      address.suburb ||
      address.neighbourhood ||
      address.residential ||
      address.village ||
      address.town ||
      address.city_district ||
      address.city;

    const city =
      address.city ||
      address.town ||
      address.city_district ||
      address.state_district;

    if (area && city && area !== city) {
      return `${area}, ${city}`;
    }

    return area || city || 'Delhi';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Location unavailable';
  }
}
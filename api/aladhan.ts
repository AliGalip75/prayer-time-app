// api/aladhan.ts

// Fetch prayer times for a specific city
export const fetchPrayerTimes = async (city: string) => {
  const date = new Date();
  const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  const url = `http://api.aladhan.com/v1/timingsByCity/${formattedDate}?city=${city}&country=Turkey&method=13`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    if (json.code === 200) {
      return json.data;
    }
    return null;
  } catch (error) {
    console.error('API Fetch Error:', error);
    return null;
  }
};
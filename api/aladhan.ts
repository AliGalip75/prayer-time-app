// api/aladhan.ts

// Fetch monthly prayer times for a specific city to allow future scheduling
export const fetchPrayerTimes = async (city: string) => {
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  // Using calendarByCity endpoint to get an array of timings for the whole month
  const url = `http://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${city}&country=Turkey&method=13&school=0&tune=10,0,0,0,0,0,0,0,0`;  try {
    const response = await fetch(url);
    const json = await response.json();
    if (json.code === 200) {
      // Returns an array of daily timing objects for the month
      return json.data;
    }
    return null;
  } catch (error) {
    console.error('API Fetch Error:', error);
    return null;
  }
};
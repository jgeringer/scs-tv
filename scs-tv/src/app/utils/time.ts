export function formatTime() {
    const date = new Date();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // If hours is 0, make it 12
    
    return `${hours}:${minutes} ${ampm}`;
  }
  
  export const REFRESH_INTERVAL = 12 * 60 * 60 * 1000; // Refresh the data every 12 hours.
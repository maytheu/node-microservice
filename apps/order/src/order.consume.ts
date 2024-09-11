export const handleIncomingOrderQueue = (data: string) => {
    try {
      const parsedData = JSON.parse(data);
  
      console.log(`Received Notification`, parsedData);
    } catch (error) {
      console.error(`Error While Parsing the message`);
    }
  };
  
import { parse } from 'date-fns';

const parseTimestamp = (timestampString) => {
  try {
    //  Attempt to parse with a common format (adjust as needed)
    const parsedDate = parse(timestampString, 'MM/dd-HH:mm:ss.SSSSSS', new Date());
    const timestamp = parsedDate.getTime();
    if (isNaN(timestamp)) {
      console.error("Invalid timestamp:", timestampString);
      return Date.now(); //  Or throw an error
    }
    console.log(`parseTimestamp: raw="<span class="math-inline">\{timestampString\}", parsed\=</span>{timestamp}`);
    return timestamp;
  } catch (error) {
    console.error("Error parsing timestamp:", timestampString, error);
    return Date.now(); // Or throw an error
  }
};

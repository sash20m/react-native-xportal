interface ErrorFormat {
  message: string;
  data?: any;
}

export const errorComposer = ({ message, data }: ErrorFormat) => {
  if (!data) {
    return message;
  }
  const dataFormatted = data?.message ? data.message : JSON.stringify(data);
  return `${message}. Error Info: ${dataFormatted}`;
};

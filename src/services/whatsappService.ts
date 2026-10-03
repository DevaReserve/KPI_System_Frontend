import api from './api';

export const whatsappService = {
  getStatus: async () => {
    const response = await api.get('/admin/wa/status');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/admin/wa/logout');
    return response.data;
  },
  
  // Note: For pairing (SSE stream), we don't use Axios, we will use EventSource directly in the component
  // The SSE endpoint URL is: import.meta.env.VITE_API_URL + '/admin/wa/pair-stream'
};

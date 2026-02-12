import { API_URL } from '../config';
import { Order } from '../types';

export const orderAPI = {
  // ============================
  // GET ALL ORDERS (ADMIN)
  // ============================
  getAllOrders: async (): Promise<Order[]> => {
    try {
      const response = await fetch(`${API_URL}/api/userorders`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but received:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // ============================
  // GET ORDER BY ORDER ID
  // ============================
  getOrderById: async (orderId: number): Promise<Order> => {
    try {
      const response = await fetch(
        `${API_URL}/api/userorders/${orderId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but received:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      return data.order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // ============================
  // GET ORDERS BY USER EMAIL
  // ============================
  getOrdersByEmail: async (email: string): Promise<Order[]> => {
    try {
      const response = await fetch(
        `${API_URL}/api/userorders/user/${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but received:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // ============================
  // UPDATE ORDER STATUS (ADMIN)
  // ============================
  updateOrderStatus: async (
    orderId: number,
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${API_URL}/api/userorders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but received:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      // Check if the response indicates success (backend returns message, not success field)
      if (!data.message || data.message.includes('Failed') || data.message.includes('Error')) {
        throw new Error(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // ============================
  // DELETE ORDER (ADMIN)
  // ============================
  deleteOrder: async (orderId: number): Promise<void> => {
    try {
      const response = await fetch(
        `${API_URL}/api/userorders/${orderId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but received:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      // Check if the response indicates success
      if (!data.message || data.message.includes('Failed') || data.message.includes('Error')) {
        throw new Error(data.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },
};

import axios from 'axios';
import { API_BASE_URL } from './apiBase';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageURL: string;
  category: string;
}

export interface FoodOrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  imageURL?: string;
  category?: string;
}

export interface CancelBookingResponse {
  bookingId: string;
  status: string;
  originalAmount: number;
  cancellationFee: number;
  refundAmount: number;
  message: string;
  booking?: any;
}

// Auth / Users
export const getUsers = () => api.get('/users');
export const getUserById = (id: string) => api.get(`/users/${id}`);
export const loginUser = (email: string) => api.get(`/users?email=${email}`);

// Movies
export const getMovies = () => api.get('/movies');
export const getMovieById = (id: string) => api.get(`/movies/${id}`);

// Cities
export const getCities = () => api.get('/cities');

// Theatres & Halls
export const getTheatresByCity = (cityId: string) => api.get(`/theatres?cityId=${cityId}`);
export const getHallsByTheatre = (theatreId: string) => api.get(`/halls?theatreId=${theatreId}`);
export const getTheatreById = (id: string) => api.get(`/theatres/${id}`);
export const getHallById = (id: string) => api.get(`/halls/${id}`);

// Shows
export const getShows = () => api.get('/shows');
export const getShowsByMovieAndCity = (movieId: string, cityId: string) => api.get(`/shows?movieId=${movieId}&cityId=${cityId}`);
export const getShowById = (id: string) => api.get(`/shows/${id}`);

// Food & Beverages
export const getFoodItems = () => api.get<FoodItem[]>('/food');
export const getFoods = getFoodItems;

export interface ModifyFoodResponse {
  booking: any;
  previousFoodTotal: number;
  newFoodTotal: number;
  priceDifference: number;
  extraToPay: number;
  refundAmount: number;
  message: string;
}

// Bookings
export const getBookingsByUser = (userId: string) => api.get(`/bookings?userId=${userId}`);
export const createBooking = (bookingData: any) => api.post('/bookings', bookingData);
export const cancelBooking = (id: string) => api.delete(`/bookings/${id}`);
export const cancelBookingWithRefund = (
  id: string,
  cancelType: "ALL" | "FOOD_ONLY" = "ALL"
) => api.post<CancelBookingResponse>(`/bookings/${id}/cancel`, { cancelType });
export const modifyBookingFood = (
  bookingId: string,
  foodItems: FoodOrderItem[]
) => api.patch<ModifyFoodResponse>(`/bookings/${bookingId}/modify-food`, { foodItems });
export const updateBookingStatus = (id: string, status: string) => api.patch(`/bookings/${id}`, { status });

export default api;

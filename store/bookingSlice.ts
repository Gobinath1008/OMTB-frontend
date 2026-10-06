import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BookingState {
  selectedShowId: string | null;
  selectedSeats: string[];
  totalAmount: number;
}

const initialState: BookingState = {
  selectedShowId: null,
  selectedSeats: [],
  totalAmount: 0,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setShowId: (state, action: PayloadAction<string>) => {
      state.selectedShowId = action.payload;
      state.selectedSeats = [];
      state.totalAmount = 0;
    },
    toggleSeat: (state, action: PayloadAction<{ seatId: string; price: number }>) => {
      const index = state.selectedSeats.indexOf(action.payload.seatId);
      if (index === -1) {
        state.selectedSeats.push(action.payload.seatId);
        state.totalAmount += action.payload.price;
      } else {
        state.selectedSeats.splice(index, 1);
        state.totalAmount -= action.payload.price;
      }
    },
    clearBooking: (state) => {
      state.selectedShowId = null;
      state.selectedSeats = [];
      state.totalAmount = 0;
    },
  },
});

export const { setShowId, toggleSeat, clearBooking } = bookingSlice.actions;
export default bookingSlice.reducer;

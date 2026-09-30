import { ISchedule } from "@/types/schedule.types";
import { baseApi } from "../baseApi";
import { IResponse } from "@/types";

interface GetMySchedulesParams {
  month?: string; // YYYY-MM
  date?: string; // YYYY-MM-DD
}

export const scheduleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSchedule: builder.mutation<IResponse<ISchedule>, Partial<ISchedule>>({
      query: (data) => ({
        url: "/schedules",
        method: "POST",
        data,
      }),
      invalidatesTags: ["SCHEDULES"],
    }),

    getMySchedules: builder.query<IResponse<ISchedule[]>, GetMySchedulesParams>({
      query: (params) => ({
        url: "/schedules/my",
        method: "GET",
        params,
      }),
      providesTags: ["SCHEDULES"],
    }),

    getSingleSchedule: builder.query<IResponse<ISchedule>, string>({
      query: (id) => ({
        url: `/schedules/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "SCHEDULE", id }],
    }),

    updateSchedule: builder.mutation<
      IResponse<ISchedule>,
      {
        id: string;
        data: Partial<ISchedule>;
      }
    >({
      query: ({ id, data }) => ({
        url: `/schedules/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "SCHEDULES",
        { type: "SCHEDULE", id },
      ],
    }),

    deleteSchedule: builder.mutation<IResponse<null>, string>({
      query: (id) => ({
        url: `/schedules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        "SCHEDULES",
        { type: "SCHEDULE", id },
      ],
    }),
  }),

  overrideExisting: true,
});

export const {
  useCreateScheduleMutation,
  useGetMySchedulesQuery,
  useGetSingleScheduleQuery,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} = scheduleApi;
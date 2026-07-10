import api from './axios';

import type {
  ApiSuccessResponse,
} from '../types/api';

import type {
  UpdateProfilePayload,
  UserProfile,
  PublicFreelancerProfilePayload,
  PublicClientProfilePayload,
} from '../types/profile';



export const profileApi = {


  getMe: () =>
    api.get<ApiSuccessResponse<UserProfile>>(
      '/api/v1/profiles/me'
    ),



  updateMe: (
    payload: UpdateProfilePayload
  ) =>
    api.patch<ApiSuccessResponse<UserProfile>>(
      '/api/v1/profiles/me',
      payload
    ),



  uploadAvatar: (
    file: File
  ) => {

    const formData = new FormData();

    formData.append(
      'avatar',
      file
    );


    return api.post<ApiSuccessResponse<UserProfile>>(
      '/api/v1/profiles/me/avatar',
      formData,
      {
        headers:{
          'Content-Type':
          'multipart/form-data',
        },
      }
    );
  },

  getFreelancerPublic: (freelancerId: string) =>
    api.get<ApiSuccessResponse<PublicFreelancerProfilePayload>>(
      `/api/v1/profiles/freelancers/${freelancerId}`
    ),

  getClientPublic: (clientId: string) =>
    api.get<ApiSuccessResponse<PublicClientProfilePayload>>(
      `/api/v1/profiles/clients/${clientId}`
    ),


};
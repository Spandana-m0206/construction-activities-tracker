import ApiResponse from './apiResponse.js';

class PaginatedApiResponse extends ApiResponse {
  constructor(
    statusCode = 200,
    data = [],
    message = 'Success',
    page = 1,
    limit = 10,
    totalCount = 0
  ) {
    super(statusCode, data, message);

    this.pagination = {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    };
  }
}

export default PaginatedApiResponse;

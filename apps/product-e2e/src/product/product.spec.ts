import { jest } from '@jest/globals';
import { AppError, HttpStatus } from '@app/core';
import { v2 as cloudinary } from 'cloudinary';
import Product from '../../../product/src/product.model';
import ProductService from '../../../product/src/product.service';

describe('ProductService - newProduct', () => {
  const mockProductData: any = {
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    quantity: 10,
    image: 'test-image-url',
  };

  const mockImageResponse: any = {
    secure_url: 'https://cloudinary.com/test-image',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new product when image is successfully uploaded', async () => {
    jest
      .spyOn(cloudinary.uploader, 'upload')
      .mockResolvedValue(mockImageResponse);
    jest.spyOn(Product, 'create').mockResolvedValue(mockProductData);

    const result = await ProductService.newProduct(mockProductData);

    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
      mockProductData.image
    );
    expect(Product.create).toHaveBeenCalledWith({
      ...mockProductData,
      image: mockImageResponse.secure_url,
    });
    expect(result).toEqual(mockProductData);
  });

  it('should return an error if the image upload fails', async () => {
    const mockCloudinaryError: any = { name: 'Error', error: 'Upload failed' };
    jest
      .spyOn(cloudinary.uploader, 'upload')
      .mockResolvedValue(mockCloudinaryError);

    const result = await ProductService.newProduct(mockProductData);

    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
      mockProductData.image
    );
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('Error uploading file');
    expect(result.statusCode).toBe(HttpStatus.HTTP_BAD_REQUEST);
  });

  it('should return an error if the product creation fails', async () => {
    jest
      .spyOn(cloudinary.uploader, 'upload')
      .mockResolvedValue(mockImageResponse);
    const mockError = new Error('Database Error');
    jest.spyOn(Product, 'create').mockRejectedValue(mockError);

    const result = await ProductService.newProduct(mockProductData);

    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
      mockProductData.image
    );
    expect(Product.create).toHaveBeenCalled();
    expect(result).toEqual(mockError);
  });
});

import { jest } from '@jest/globals';
import createHttpError from 'http-errors';
import { postgresQlClient } from '../../Configs/PostgresQl.js';
import {
    indexService,
    storeService,
    showService,
    updateService,
    destroyService,
    changeStatusService,
    assignPermissionService
} from './Permission.service.js';

// Mock dependencies
jest.mock('../../Configs/PostgresQl.js', () => ({
    postgresQlClient: jest.fn()
}));

describe('Permission Service', () => {
    let mockClient;
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock client
        mockClient = {
            query: jest.fn(),
            release: jest.fn()
        };
        postgresQlClient.mockResolvedValue(mockClient);

        // Setup mock request
        mockReq = {
            query: {},
            params: {},
            body: {}
        };

        // Setup mock response
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Setup mock next function
        mockNext = jest.fn();
    });

    describe('indexService', () => {
        test('should fetch permissions with pagination', async () => {
            mockReq.query = { page: 1, limit: 10 };
            mockClient.query.mockResolvedValueOnce({
                rows: [
                    { id: 1, name: 'Permission 1', description: 'Description 1' },
                    { id: 2, name: 'Permission 2', description: 'Description 2' }
                ]
            });

            await indexService(mockReq, mockRes, mockNext);

            expect(mockClient.query).toHaveBeenCalledWith(
                'SELECT * FROM permissions LIMIT $1 OFFSET $2',
                [10, 0]
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Permissions fetched successfully'
            }));
        });
    });

    describe('storeService', () => {
        test('should create new permission', async () => {
            mockReq.body = {
                name: 'New Permission',
                description: 'New Permission Description'
            };
            mockClient.query.mockResolvedValueOnce({
                rows: [{
                    id: 1,
                    name: 'New Permission',
                    description: 'New Permission Description',
                    slug: 'new-permission'
                }]
            });

            await storeService(mockReq, mockRes, mockNext);

            expect(mockClient.query).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Permission created successfully'
            }));
        });

        test('should handle missing required fields', async () => {
            mockReq.body = { name: 'New Permission' };

            await storeService(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(createHttpError.BadRequest));
        });
    });

    describe('showService', () => {
        test('should fetch single permission', async () => {
            mockReq.params = { slug: 'test-permission' };
            mockClient.query.mockResolvedValueOnce({
                rows: [{
                    id: 1,
                    name: 'Test Permission',
                    description: 'Test Description',
                    slug: 'test-permission'
                }]
            });

            await showService(mockReq, mockRes, mockNext);

            expect(mockClient.query).toHaveBeenCalledWith(
                'SELECT * FROM permissions WHERE slug = $1',
                ['test-permission']
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Permission fetched successfully'
            }));
        });

        test('should handle non-existent permission', async () => {
            mockReq.params = { slug: 'non-existent' };
            mockClient.query.mockResolvedValueOnce({ rows: [] });

            await showService(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(createHttpError.NotFound));
        });
    });

    describe('updateService', () => {
        test('should update permission', async () => {
            mockReq.params = { slug: 'test-permission' };
            mockReq.body = {
                name: 'Updated Permission',
                description: 'Updated Description'
            };
            mockClient.query.mockResolvedValueOnce({
                rows: [{
                    id: 1,
                    name: 'Updated Permission',
                    description: 'Updated Description',
                    slug: 'test-permission'
                }]
            });

            await updateService(mockReq, mockRes, mockNext);

            expect(mockClient.query).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Permission updated successfully'
            }));
        });
    });

    describe('destroyService', () => {
        test('should delete permission', async () => {
            mockReq.params = { slug: 'test-permission' };
            mockClient.query.mockResolvedValueOnce({ rowCount: 1 });

            await destroyService(mockReq, mockRes, mockNext);

            expect(mockClient.query).toHaveBeenCalledWith(
                'DELETE FROM permissions WHERE slug = $1',
                ['test-permission']
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Permission deleted successfully'
            }));
        });
    });

    describe('changeStatusService', () => {
        test('should toggle permission status', async () => {
            mockReq.params = { slug: 'test-permission' };
            mockClient.query
                .mockResolvedValueOnce({
                    rows: [{ id: 1, status: 1 }]
                })
                .mockResolvedValueOnce({
                    rows: [{ id: 1, status: 0 }]
                });

            await changeStatusService(mockReq, mockRes, mockNext);

            expect(mockClient.query).toHaveBeenCalledTimes(2);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Permission status updated successfully'
            }));
        });
    });

    describe('assignPermissionService', () => {
        test('should assign permissions to role', async () => {
            mockReq.body = {
                role_id: 1,
                permissions: [1, 2, 3]
            };
            mockClient.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] })
                .mockResolvedValueOnce({ rowCount: 1 })
                .mockResolvedValueOnce({ rowCount: 1 })
                .mockResolvedValueOnce({ rowCount: 1 });

            await assignPermissionService(mockReq, mockRes, mockNext);

            expect(mockClient.query).toHaveBeenCalledTimes(5);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Permissions assigned successfully'
            }));
        });

        test('should handle non-existent role', async () => {
            mockReq.body = {
                role_id: 999,
                permissions: [1, 2, 3]
            };
            mockClient.query.mockResolvedValueOnce({ rows: [] });

            await assignPermissionService(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(createHttpError.NotFound));
        });
    });
}); 
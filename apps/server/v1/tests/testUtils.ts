import { Request, Response } from "express";
import { User } from "../global.d.ts";

export const mockRequest = (params: any = {}, body: any = {}, user: Partial<User> = {}) => {
  const req = {
    params,
    body,
    user: {
      id: "test-user-id",
      activeRepos: 0,
      planName: "FREE",
      plan: {
        id: "free-plan-id",
        name: "FREE",
        price: 0,
        maxRepos: 1,
        description: "Free plan",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ...user,
    },
  } as unknown as Request;
  return req;
};

export const mockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
};

export const mockNext = () => {
  return jest.fn();
};
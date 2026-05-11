import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { apiOk } from "../utils/api-response";
import { emitRealtime } from "../utils/socket";
import * as marketplaceService from "../services/marketplace.service";

export async function getAllListings(_request: Request, response: Response) {
  const data = await marketplaceService.listMarketplace();
  response.json(apiOk(data));
}

export async function createListing(request: Request, response: Response) {
  const sellerId = (request as any).user?.uid ?? "anonymous";
  const data = await marketplaceService.createListing(request.body, sellerId);
  emitRealtime(request, "marketplace:new", data);
  response.status(StatusCodes.CREATED).json(apiOk(data));
}

export async function updateListing(request: Request, response: Response) {
  const sellerId = (request as any).user?.uid ?? "anonymous";
  const id = String(request.params.id ?? "");
  const data = await marketplaceService.updateListing(id, request.body, sellerId);
  emitRealtime(request, "marketplace:update", data);
  response.json(apiOk(data));
}

export async function deleteListing(request: Request, response: Response) {
  const sellerId = (request as any).user?.uid ?? "anonymous";
  const id = String(request.params.id ?? "");
  await marketplaceService.deleteListing(id, sellerId);
  emitRealtime(request, "marketplace:delete", { id });
  response.status(StatusCodes.NO_CONTENT).send();
}

export async function markAsSold(request: Request, response: Response) {
  const id = String(request.params.id ?? "");
  const data = await marketplaceService.markListingSold(id);
  emitRealtime(request, "marketplace:sold", data);
  response.json(apiOk(data));
}


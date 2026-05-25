import type { RequestHandler } from "express";
import { contentSecurityPolicy } from "helmet";

const SWAGGER_UI_BASE_PATH = "/api-docs";

function isSwaggerUiPath(path: string): boolean {
  return path === SWAGGER_UI_BASE_PATH || path.startsWith(`${SWAGGER_UI_BASE_PATH}/`);
}

const swaggerUiCsp = contentSecurityPolicy({
  useDefaults: false,
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "blob:"],
    fontSrc: ["'self'", "data:"],
    connectSrc: ["'self'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    frameAncestors: ["'none'"]
  }
});

const strictAppCsp = contentSecurityPolicy({
  directives: {
    ...contentSecurityPolicy.getDefaultDirectives()
  }
});

export const cspByPath: RequestHandler = (...args) => {
  const [req, res, next] = args;

  if (isSwaggerUiPath(req.path)) {
    return swaggerUiCsp(req, res, next);
  }

  return strictAppCsp(req, res, next);
};

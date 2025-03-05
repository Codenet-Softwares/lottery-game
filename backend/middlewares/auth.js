
import jwt from "jsonwebtoken";
import { string } from "../constructor/string.js";
import { statusCode } from "../utils/statusCodes.js";
import { apiResponseErr } from "../utils/response.js";
import Admin from "../models/adminModel.js";

// const tokenBlacklist = new Set();

export const authorize = (roles, permissions) => {
  return async (req, res, next) => {
    try {

      const authToken = req?.headers?.authorization;
      if (!authToken) {
        return apiResponseErr(
          null,
          false,
          statusCode.unauthorize,
          "Unauthorize",
          res
        );
      }

      const tokenParts = authToken.split(" ");
      if (
        tokenParts.length !== 2 ||
        !(tokenParts[0] === "Bearer" && tokenParts[1])
      ) {
        return apiResponseErr(
          null,
          false,
          statusCode.unauthorize,
          "Invalid token format",
          res
        );
      }

      // const token = tokenParts[1];
      // let decodedUser;
      // try {
      //   decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // } catch (error) {
      //   return apiResponseErr(null, false, statusCode.unauthorize, 'Token verification failed', res);
      // }

      // if (!decodedUser) {
      //   return apiResponseErr(null, false, statusCode.unauthorize, 'Unauthorized access: No user decoded from token', res);
      // }

      let user;
      try {
        user = jwt.verify(tokenParts[1], process.env.JWT_SECRET_KEY);
      } catch (error) {
        return apiResponseErr(
          null,
          false,
          statusCode.unauthorize,
          "Unauthorize",
          res
        );
      }

      if (!user) {
        return apiResponseErr(
          null,
          false,
          statusCode.unauthorize,
          "Unauthorized access: No user decoded from token",
          res
        );
      }

      let existingUser;

      if (roles.includes(string.Admin) || roles.includes(string.SubAdmin)) {
        existingUser = await Admin.findOne({
          where: { adminId: user.adminId },
        });
      }

      
      if (!existingUser) {
        return apiResponseErr(
          null,
          false,
          statusCode.unauthorize,
          "Unauthorized access: User not found in database",
          res
        );
      }

      const rolesArray = existingUser.role ? existingUser.role.split(",") : [];

      if (roles && roles.length > 0) {
        const userHasRequiredRole = roles.some((role) =>
          rolesArray.includes(role)
        );

        if (!userHasRequiredRole) {
          return apiResponseErr(
            rolesArray,
            false,
            statusCode.unauthorize,
            "Unauthorized access: User does not have required role",
            res
          );
        }
      }

      if (permissions && permissions.length > 0) {
        const userPermissions = existingUser.permissions ? existingUser.permissions.split(',') : [];

        let userHasRequiredPermission = false;

        if (rolesArray.includes(string.Admin)) {
          userHasRequiredPermission = true;
        } else {
          permissions.forEach((per) => {
            if (userPermissions.map(p => p.trim()).includes(per)) {
              userHasRequiredPermission = true;
            }
          });
        }
        
        if (!userHasRequiredPermission) {
          return apiResponseErr(
            null,
            false,
            statusCode.unauthorize,
            "Unauthorized access: User does not have required permission",
            res
          );
        }
      }

      (req.user = existingUser),
        //  { accessToken: token };
        next();
    } catch (error) {
      return apiResponseErr(
        null,
        false,
        error.responseCode ?? statusCode.internalServerError,
        error.errMessage ?? error.message,
        res
      );
    }
  };
};

// export const addToBlacklist = (token) => {
//   tokenBlacklist.add(token);
// };

// export const removeFromBlacklist = (token) => {
//   tokenBlacklist.delete(token);
// };

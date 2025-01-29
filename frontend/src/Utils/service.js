import { toast } from 'react-toastify';
import strings from './constant/stringConstant';

export function getNoAuthCallParams(methodType, body) {
  const params = {
    method: methodType,
    headers: strings.applicationJSON,
  };
  switch (methodType) {
    case strings.GET:
      return params;
    case strings.POST:
      return { ...params, body: JSON.stringify(body) };
    default:
      return false;
  }
}

// export async function getHeaderObject(accessToken, contentType) {
//   try {
//     if (accessToken) {
//       return {
//         ...contentType,
//         authorization: `Bearer ${accessToken}`,
//       };
//     }
//     return null;
//   } catch (error) {
//     throw error;
//   }
// }

// getNoAuthCallParams private api call

export async function getHeaderObject(accessToken, contentType) {
  const headers = {
    ...contentType,
  };

  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }

  return headers; // Ensure you return headers regardless of the token presence
}

export const getAuthCallParams = async (methodType, body) => {
  const store = JSON.parse(localStorage.getItem(strings.LOCAL_STORAGE_KEY));
  const accessToken = store?.admin?.accessToken;
  const params = {
    method: methodType,
    headers: await getHeaderObject(accessToken, strings.applicationJSON),
  };

  switch (methodType) {
    case 'GET':
      return params;
    case 'POST':
      return { ...params, body: JSON.stringify(body) };
    case 'PUT':
      return { ...params, body: JSON.stringify(body) };
    case 'DELETE':
      return params;

    default:
      throw new Error(`Unsupported method type: ${methodType}`);
  }
};

export async function makeCall(callName, callParams, isToast = true) {
  try {

       // Ensure no toast messages for GET requests
    const isGetRequest = callParams.method === "GET";
    if (isGetRequest) isToast = false;
    let call = await fetch(callName, callParams);
    let timeout = getTimeoutPromise();

    const response = await Promise.race([timeout, call]);
    const json = await response.json();

    if (response.status === 401) {
      localStorage.clear();
      sessionStorage.setItem("sessionExpired", true);
      window.location.href = "/";
      return null; // Stop further processing
    }

    if (response.status === 400) {
      toast.error(json.errMessage || "Bad request. Please try again.");
      return null;
    }

    if (!response.ok) {
      const errorMessage =
        json?.message || `Error: ${response.status} ${response.statusText}`;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (isToast && json.success) {
      toast.success(json.message || "Operation successful");
    }

    return json;
  } catch (error) {
    console.error("Error in makeCall:", error); // Log errors
    toast.error(error.message || "An error occurred");
    throw error; // Rethrow to handle upstream
  }
}

export function getTimeoutPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject({ error: true, message: 'Timeout', success: false }), 5000);
  });
}


//   export const checkStatus = async (error) => {
//     const navigate = useNavigate();
//     if (error.status === 403 || error.status === 401) {
//       localStorage.clear();
//        navigate(urls.landingViewPath);
//       return true;
//     } else return false;
//   };

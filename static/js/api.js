const API_BASE_URL = "/api";

function getHeaders(isUpload = false) {
    const headers = {};
    if (!isUpload) {
        headers["Content-Type"] = "application/json";
    }
    const token = localStorage.getItem("token");
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        headers["X-CSRF-Token"] = token;
    }
    return headers;
}

async function handleResponse(response) {
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        data = { message: await response.text() };
    }

    if (!response.ok) {
        const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
    }
    return data;
}

async function apiGet(endpoint, params = {}) {
    let url = `${API_BASE_URL}${endpoint}`;
    if (Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        url += `?${queryString}`;
    }
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: getHeaders()
        });
        return handleResponse(response);
    } catch (error) {
        console.error("API Error:", error);
        throw new Error(error.message === "Failed to fetch" ? "Backend is not connected. Please start Flask server and check API URL." : error.message);
    }
}

async function apiPost(endpoint, body = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        return handleResponse(response);
    } catch (error) {
        console.error("API Error:", error);
        throw new Error(error.message === "Failed to fetch" ? "Backend is not connected. Please start Flask server and check API URL." : error.message);
    }
}

async function apiPut(endpoint, body = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        return handleResponse(response);
    } catch (error) {
        console.error("API Error:", error);
        throw new Error(error.message === "Failed to fetch" ? "Backend is not connected. Please start Flask server and check API URL." : error.message);
    }
}

async function apiDelete(endpoint, body = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: getHeaders(),
            body: Object.keys(body).length ? JSON.stringify(body) : undefined
        });
        return handleResponse(response);
    } catch (error) {
        console.error("API Error:", error);
        throw new Error(error.message === "Failed to fetch" ? "Backend is not connected. Please start Flask server and check API URL." : error.message);
    }
}

async function apiUpload(endpoint, formData) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: getHeaders(true),
            body: formData
        });
        return handleResponse(response);
    } catch (error) {
        console.error("API Error:", error);
        throw new Error(error.message === "Failed to fetch" ? "Backend is not connected. Please start Flask server and check API URL." : error.message);
    }
}

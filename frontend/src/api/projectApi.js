import jwtAxios from "../util/jwtUtil";
import { API_SERVER_HOST } from "./memberApi";

export const getProjectList = async (brandId) => {
    const res = await jwtAxios.get(
        `${API_SERVER_HOST}/api/brands/${brandId}/projects`
    );
    return res.data;
};

export const getProjectDetail = async (brandId, projectId) => {
    const res = await jwtAxios.get(
        `${API_SERVER_HOST}/api/brands/${brandId}/projects/${projectId}`
    );
    return res.data;
};

export const createProject = async (brandId, data) => {
    const res = await jwtAxios.post(
        `${API_SERVER_HOST}/api/brands/${brandId}/projects`,
        data
    );
    return res.data;
};

export const updateProject = async (brandId, projectId, data) => {
    await jwtAxios.put(
        `${API_SERVER_HOST}/api/brands/${brandId}/projects/${projectId}`,
        data
    );
};

export const deleteProject = async (brandId, projectId) => {
    await jwtAxios.delete(
        `${API_SERVER_HOST}/api/brands/${brandId}/projects/${projectId}`
    );
};

import { API_SERVER_HOST } from "../../api/memberApi";
import jwtAxios from "../../util/jwtUtil";

// 기본 호스트 설정 (dashboard 관련 API이므로 경로 확인 필요)
const host = `${API_SERVER_HOST}/api/dashboard`; 

const getBrandMentionSummary = async (brandId, appliedChannels) => {
    // 1. URL과 설정 객체(params 포함)를 올바르게 연결
    // 2. params를 두 번째 인자로 전달해야 함
    const res = await jwtAxios.get(`${host}/mention/analysis`, {
        params: {
            brandId: brandId,
            contentChannel: appliedChannels.join(',') // "NAVER,YOUTUBE"
        }
    });
    
    return res.data;
};

const getBrandMentionChart = async (brandId, appliedChannels, unit) => {
    const res = await jwtAxios.get(`${host}/mention/chart`, {
        params: {
            brandId: brandId,
            unit: unit,
            contentChannel: appliedChannels.join(',') // "NAVER,YOUTUBE"
        }
    });
    return res.data;
};

const getBrandSentimentSummary = async (brandId, appliedChannels) => {
    const res = await jwtAxios.get(`${host}/sentiment/analysis`, {
        params: {
            brandId: brandId,
            contentChannel: appliedChannels.join(',') // "NAVER,YOUTUBE"
        }
    });
    return res.data;
};

const getBrandWordCloudData = async (brandId, appliedChannels) => {
    const res = await jwtAxios.get(`${host}/sentiment/wordcloud`, {
        params: {
            brandId: brandId,
            contentChannel: appliedChannels.join(',') // "NAVER,YOUTUBE"
        }
    });
    return res.data;
};

const getBrandSentimentChart = async (brandId, appliedChannels, unit) => {
    const res = await jwtAxios.get(`${host}/sentiment/chart`, {
        params: {
            brandId: brandId,
            unit: unit,
            contentChannel: appliedChannels.join(',') // "NAVER,YOUTUBE"
        }
    });
    return res.data;
};

export { getBrandMentionSummary, getBrandMentionChart, getBrandSentimentSummary, getBrandWordCloudData, getBrandSentimentChart };
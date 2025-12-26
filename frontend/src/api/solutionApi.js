import axios from "axios";
import { API_SERVER_HOST } from "./memberApi";


const host = `${API_SERVER_HOST}/api/solution`;


//NEW전략
export const getLatestStrategyByProject = async (projectid) => {
    const res = await axios.get(`${host}/latest/strategy/${projectid}`);

    return res.data;
}
//전체보기 
export const getAllSolutionByProject = async (page, size, projectid) => {
    const res = await axios.get(`${host}/list`, {
      params: {
        page,
        size,
        projectid
      }
    });
  
    return res.data;
  };
  //삭제 
  export const removeSolution = async (solutionid) => {
    const res = await axios.delete(`${host}/delete/${solutionid}`);

    return res.data;
}



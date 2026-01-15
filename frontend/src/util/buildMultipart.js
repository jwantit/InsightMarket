// 공통 multipart 빌더: data(JSON) + files 배열을 FormData로 변환
// data 객체는 JSON 문자열로 변환하여 "data" 파트에 담고,
// files 배열은 존재할 경우 "files" 필드로 추가한다.

const buildMultipart = (data, files = []) => {
  const formData = new FormData();

  const json = typeof data === "string" ? data : JSON.stringify(data);
  formData.append("data", new Blob([json], { type: "application/json" }));

  if (Array.isArray(files)) {
    files.filter(Boolean).forEach((file) => {
      formData.append("files", file);
    });
  }

  return formData;
};

export default buildMultipart;
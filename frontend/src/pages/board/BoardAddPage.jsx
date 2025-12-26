import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createBoardThunk } from "../../store/slices/boardSlice";
import useBoardRouteParams from "../../hooks/common/useBoardRouteParams";

const BoardAddPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { brandId } = useBoardRouteParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(
      createBoardThunk({
        brandId,
        payload: { data: { title, content }, files: Array.from(files) },
      })
    );

    if (createBoardThunk.fulfilled.match(resultAction)) {
      const newBoard = resultAction.payload;
      navigate(`/app/${brandId}/board/discussion/read/${newBoard.id}`);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제목
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="제목을 입력하세요"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          내용
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={async (e) => {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
              if (items[i].type.indexOf("image") !== -1) {
                e.preventDefault();
                const file = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                  const imageUrl = event.target.result;
                  const imageTag = `<img src="${imageUrl}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
                  setContent((prev) => prev + (prev ? '\n' : '') + imageTag);
                };
                reader.readAsDataURL(file);
                
                // 파일도 함께 첨부
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                const newFiles = Array.from(files);
                newFiles.push(...Array.from(dataTransfer.files));
                setFiles(newFiles);
              }
            }
          }}
          rows={10}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
          placeholder="내용을 입력하세요 (이미지 붙여넣기 가능)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          파일
        </label>
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!title || !content}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          등록
        </button>
      </div>
    </form>
  );
};

export default BoardAddPage;
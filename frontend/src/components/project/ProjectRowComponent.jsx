const ProjectRowComponent = ({ project, onEdit, onDelete }) => {
    const today = new Date();
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);

    let status;
    let statusClass;

    if (today < start) {
        status = "진행전";
        statusClass = "bg-yellow-50 text-yellow-700 ring-yellow-200";
    } else if (today <= end) {
        status = "진행중";
        statusClass = "bg-green-50 text-green-700 ring-green-200";
    } else {
        status = "종료";
        statusClass = "bg-gray-100 text-gray-600 ring-gray-200";
    }

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-4 py-3">
                <div className="font-semibold text-gray-900">{project.name}</div>
            </td>

            <td className="px-4 py-3 text-gray-700">
                {project.startDate} ~ {project.endDate}
            </td>

            <td className="px-4 py-3">
                <span
                    className={[
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1",
                        statusClass,
                    ].join(" ")}
                >
                    {status}
                </span>
            </td>

            <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => onEdit(project.projectId)}
                        className="rounded-lg border px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    >
                        수정
                    </button>
                    <button
                        onClick={() => onDelete(project.projectId)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                        삭제
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ProjectRowComponent;

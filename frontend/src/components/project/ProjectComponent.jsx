import { useEffect, useState } from "react";
import {
    getProjectList,
    getProjectDetail,
    createProject,
    updateProject,
    deleteProject
} from "../../api/projectApi";
import ProjectListComponent from "./ProjectListComponent";
import ProjectModalComponent from "./ProjectModalComponent";
import { useBrand } from "../../hooks/brand/useBrand";
import { confirmAlert } from "../../hooks/common/useAlert";

const ProjectComponent = () => {
    const { brandId } = useBrand();

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        if (!brandId) return;
        getProjectList(brandId).then(setProjects);
    }, [brandId]);

    const openCreate = () => {
        setSelectedProject({
            name: "",
            startDate: "",
            endDate: "",
            keywords: []
        });
        setOpenModal(true);
    };

    const openEdit = async (projectId) => {
        const detail = await getProjectDetail(brandId, projectId);
        setSelectedProject(detail);
        setOpenModal(true);
    };

    const handleSave = async (data) => {
        if (data.projectId) {
            await updateProject(brandId, data.projectId, data);
        } else {
            await createProject(brandId, data);
        }
        setOpenModal(false);
        getProjectList(brandId).then(setProjects);
    };

    const handleDelete = async (projectId) => {
        const confirmed = await confirmAlert("프로젝트를 정말 삭제하시겠습니까?");
        if (!confirmed) return;
        await deleteProject(brandId, projectId);
        getProjectList(brandId).then(setProjects);
    };

    return (
        <>
            <ProjectListComponent
                projects={projects}
                onCreate={openCreate}
                onEdit={openEdit}
                onDelete={handleDelete}
            />

            {openModal && (
                <ProjectModalComponent
                    project={selectedProject}
                    onClose={() => setOpenModal(false)}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default ProjectComponent;

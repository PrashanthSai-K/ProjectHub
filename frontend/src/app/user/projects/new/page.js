import React from 'react';
import Layout from "@/components/project/layout";
import ProjectForm from '@/components/project/project-create-form';
import ProjectCreateForm from '@/components/project/project-create-form';


export default function page() {
    return (
        <Layout>
                {/* <h2 className="text-3xl font-bold">Create New Project</h2> */}
                <ProjectCreateForm  />
        </Layout>
    )
}

import React from 'react';
import Layout from "@/components/project/layout";
import ProjectForm from '@/components/project/project-form';


export default function page() {
    return (
        <Layout>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold">Create New Project</h2>
                <ProjectForm  />
            </div>
        </Layout>
    )
}

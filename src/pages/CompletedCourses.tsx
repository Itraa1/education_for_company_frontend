import DashboardLayout from "./DashboardLayout";

export default function CompletedCourses() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Завершенные курсы</h1>
        <p className="page-subtitle">Курсы, которые вы успешно прошли</p>
      </div>
    </DashboardLayout>
  );
}

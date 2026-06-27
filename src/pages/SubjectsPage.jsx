import SubjectManager from '../components/SubjectManager'

export default function SubjectsPage({ subjects, onAdd, onUpdate, onDelete }) {
  return (
    <div className="space-y-4">
      <SubjectManager subjects={subjects} onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete} />
    </div>
  )
}

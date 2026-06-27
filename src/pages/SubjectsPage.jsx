import SubjectManager from '../components/SubjectManager'

export default function SubjectsPage({ subjects, onAdd, onDelete }) {
  return (
    <div className="space-y-4">
      <SubjectManager subjects={subjects} onAdd={onAdd} onDelete={onDelete} />
    </div>
  )
}

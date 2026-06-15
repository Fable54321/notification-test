import { useState } from "react"



type addTaskToDateProps = {
    onClose: () => void
}



const AddTaskToDate = ({ onClose } : addTaskToDateProps) => {

const [taskDescription, setTaskDescription] = useState('')
const [isPeriodic, setIsPeriodic] = useState(false)
const [periodicity, setPeriodicity] = useState('')

  return (
    <article className="font-tertiary flex flex-col items-center">
        <button onClick={onClose}>X</button>
        <h2>Ajout d'une tâche pour la date du :</h2>
        <form action="">
            
        </form>
    </article>
  )
}

export default AddTaskToDate

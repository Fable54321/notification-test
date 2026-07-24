import './CSS/Spinner.css';
import { Loader } from "lucide-react";




const Spinner = () => {
    return (
        <div className="flex justify-center w-full">
            <Loader className="animate-spin text-primary" size={90} />
        </div>
    )
}

export default Spinner

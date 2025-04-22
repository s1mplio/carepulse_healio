import AppointmentForm from "@/components/forms/AppointmentForm";
import PatientForm from "@/components/forms/PatientForm";
import { getPatient } from "@/lib/actions/patient.actions";
import Image from "next/image";
import Link from "next/link";



export default async function NewAppointment ({params:{userId}}:SearchParamProps) {
    
    let patient = null;
    try {
        patient = await getPatient(userId);
    } catch (error) {
        console.error("Error fetching patient:", error);
    }
    
    const patientId = patient ? patient.$id : '';
  return (
    <div className="flex h-screen max-h-screen">
      

      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[860px] flex-1 justify-between">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="patient"
            className="mb-12 h-10 w-fit"
          />
          <AppointmentForm
             type="create"
            userId={userId}
            patientId={patientId}
           
            
            />
       

          
            <p className="copyright mt-10 py-12">
              © 2025 CarePluse
            </p>
         
          
        </div>
      </section>

      <Image
        src="/assets/images/appointment-img.png"
        height={1000}
        width={1000}
        alt="patient"
        className="side-img max-w-[390px] bg-bottom"
      />
    </div>
  );
};


import PatientForm from "@/components/forms/PatientForm";
import PassKeyModal from "@/components/PassKeyModal";
import Image from "next/image";
import Link from "next/link";



const Home = ({searchParams}:SearchParamProps) => {
    const isAdmin=  searchParams.admin==='true'

  return (
    <div className="flex h-screen max-h-screen">
      {isAdmin && <PassKeyModal/>}

      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[496px]">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="patient"
            className="mb-12 h-10 w-fit"
          />
          <PatientForm/>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-dark-500 bg-dark-400 p-5 text-sm text-dark-500">
              <p className="mb-3 text-white">Need a quick triage recommendation?</p>
              <Link href="/symptom-checker" className="font-medium text-green-500 hover:text-green-400">
                AI Symptom Checker
              </Link>
            </div>
            <div className="rounded-3xl border border-dark-500 bg-dark-400 p-5 text-sm text-dark-500">
              <p className="mb-3 text-white">Want to discuss your health with an AI?</p>
              <Link href="/doctor-chat" className="font-medium text-blue-500 hover:text-blue-400">
                Chat with Dr. CarePulse
              </Link>
            </div>
          </div>

          <div className="text-14-regular mt-20 flex justify-between">
            <p className="justify-items-end text-dark-600 xl:text-left">
              © 2025 CarePluse
            </p>
            <Link href="/?admin=true" className="text-green-500">
              Admin
            </Link>
          </div>
        </div>
      </section>

      <Image
        src="/assets/images/onboarding-img.png"
        height={1000}
        width={1000}
        alt="patient"
        className="side-img max-w-[50%]"
      />
    </div>
  );
};

export default Home;
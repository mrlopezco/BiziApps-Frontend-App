import Link from "next/link"
import Image from "next/image"
import { ReactNode } from "react"
import { DashboardGradient } from "@/components/gradients/dashboard-gradient"
import "../../../styles/dashboard.css"
import { SettingsMenuBar } from "@/components/settings/layout/settings-menu-bar"

interface Props {
  children: ReactNode
}

export function SettingsLayout({ children }: Props) {
  return (
    <div className="bg-grey">
      <div className="mb-6 bg-black">
        <SettingsMenuBar />
      </div>
      {children}
      {/* <div className="grid w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] relative min-h-[calc(100vh-4rem)] ">
        
        <div className="hidden border-r md:block relative">
          <div className="flex h-full flex-col gap-2">
            <div className="flex items-center pt-8 pl-6 pb-10">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Image src={"/assets/icons/logo/BiziApps-logo-icon.svg"} alt={"BiziApps"} width={41} height={41} />
              </Link>
            </div>
            <div className="flex flex-col grow"></div>
          </div>
        </div>
        <div className="flex flex-col"></div>
      </div> */}
    </div>
  )
}

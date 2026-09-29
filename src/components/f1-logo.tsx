import Logo from '@/assets/f1-logo.png'

type Props = {}

const F1Logo = ({}: Props) => {
  return (
    <div className='flex items-center justify-center gap-4'>
      <img
      src={Logo} alt="F1 Logo"
      className="w-30 h-20"
      />
      <p className='font-f1 text-4xl font-bold text-[#ee0000]'>PitWall</p>
    </div>
  )
}

export default F1Logo
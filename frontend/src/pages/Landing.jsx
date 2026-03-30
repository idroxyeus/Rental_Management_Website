import { Link } from "react-router-dom"
import { Button, Row, Col, Card } from "antd"
import { ShieldCheckIcon, ChartBarIcon, HomeModernIcon, CreditCardIcon } from "@heroicons/react/24/outline"

const features = [
  {
    title: "Property Management",
    description: "Easily track, manage, and scale your property portfolio with intuitive tools.",
    icon: <HomeModernIcon className="w-8 h-8 text-indigo-500" />
  },
  {
    title: "Automated Payments",
    description: "Seamlessly collect rent online. Automated tracking, receipts, and outstanding dues.",
    icon: <CreditCardIcon className="w-8 h-8 text-emerald-500" />
  },
  {
    title: "Actionable Analytics",
    description: "Gain insights into your revenue, expenses, and occupancy rates via visual dashboards.",
    icon: <ChartBarIcon className="w-8 h-8 text-blue-500" />
  },
  {
    title: "Secure & Reliable",
    description: "Built with modern security standards to keep your data and documents safe.",
    icon: <ShieldCheckIcon className="w-8 h-8 text-rose-500" />
  }
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 overflow-x-hidden selection:bg-indigo-200">
      
      {/* Navigation */}
      <nav className="w-full px-8 py-6 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-500/30">R</div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 to-indigo-500">RentalManager</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Sign in</Link>
          <Link to="/register">
            <Button type="primary" size="large" className="rounded-full px-6 shadow-md font-medium tracking-wide border-none bg-indigo-600 hover:bg-indigo-500">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 pt-32 pb-24 max-w-7xl mx-auto text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-400/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
          Manage your properties <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
            intelligently.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Experience the most elegant, powerful, and intuitive rental management platform. Streamline your workflow, delight your tenants, and grow your revenue.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register">
            <Button type="primary" size="large" style={{ height: 50, paddingInline: 32 }} className="rounded-full text-lg shadow-xl shadow-indigo-500/30 font-semibold bg-indigo-600 border-none transition-transform hover:scale-105">
              Start for free
            </Button>
          </Link>
          <Link to="/login">
            <Button size="large" style={{ height: 50, paddingInline: 32 }} className="rounded-full text-lg font-medium text-slate-700 hover:text-indigo-600 hover:border-indigo-400 transition-transform hover:scale-105">
              Login to dashboard
            </Button>
          </Link>
        </div>

        {/* Dashboard preview floating image mockup */}
        <div className="mt-24 relative mx-auto max-w-5xl group transform transition-transform duration-700 hover:-translate-y-2">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative rounded-2xl bg-white/80 backdrop-blur-xl border border-white p-2 shadow-2xl">
            <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-100 p-2 shadow-inner h-[400px] flex items-center justify-center relative">
               <div className="absolute top-0 left-0 w-full h-8 bg-slate-100/50 flex items-center px-4 gap-2 border-b border-slate-200/50">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
               <div className="text-center mt-8">
                 <ChartBarIcon className="w-16 h-16 mx-auto text-indigo-300 mb-4 animate-bounce" />
                 <h3 className="text-2xl font-bold text-slate-400">Your beautiful dashboard awaits</h3>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/60 backdrop-blur-lg border-t border-white/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need</h2>
            <p className="text-slate-500 text-lg">Powerful features wrapped in a stunning interface.</p>
          </div>
          
          <Row gutter={[32, 32]}>
            {features.map((f, i) => (
              <Col xs={24} sm={12} lg={6} key={i}>
                <Card 
                  bordered={false} 
                  className="h-full bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all duration-300 border border-white rounded-2xl transform hover:-translate-y-1"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-light">{f.description}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-slate-500 text-sm font-medium border-t border-white/50 bg-slate-50/50 backdrop-blur-md">
        <p>&copy; {new Date().getFullYear()} RentalManager. Crafted with precision.</p>
      </footer>
    </div>
  )
}

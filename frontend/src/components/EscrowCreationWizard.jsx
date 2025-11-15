import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  DollarSign, 
  FileText, 
  Shield,
  CheckCircle,
  AlertCircle,
  Upload,
  X
} from 'lucide-react';

const EscrowCreationWizard = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    sellerAddress: '',
    amount: '',
    description: '',
    requirements: '',
    deadline: '',
    evidenceFiles: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const steps = [
    {
      id: 'seller',
      title: 'Seller Details',
      icon: User,
      description: 'Enter seller information'
    },
    {
      id: 'amount',
      title: 'Escrow Amount',
      icon: DollarSign,
      description: 'Set the payment amount'
    },
    {
      id: 'terms',
      title: 'Terms & Requirements',
      icon: FileText,
      description: 'Define task requirements'
    },
    {
      id: 'review',
      title: 'Review & Create',
      icon: Shield,
      description: 'Confirm escrow details'
    }
  ];

  const validateStep = (stepIndex) => {
    const newErrors = {};
    
    switch (stepIndex) {
      case 0:
        if (!formData.sellerAddress.trim()) {
          newErrors.sellerAddress = 'Seller address is required';
        }
        break;
      case 1:
        const amount = parseFloat(formData.amount);
        if (!formData.amount || isNaN(amount) || amount <= 0) {
          newErrors.amount = 'Valid amount is required';
        }
        break;
      case 2:
        if (!formData.description.trim()) {
          newErrors.description = 'Task description is required';
        }
        if (!formData.requirements.trim()) {
          newErrors.requirements = 'Requirements are required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      evidenceFiles: [...prev.evidenceFiles, ...files]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Escrow creation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
tionWizard;owCreault Escrexport defa

};
);
  
    </div>div>on.</moti   
   </Card>       dContent>
 Car</   
          </div>        )}
          tton>
         </Bu          
  />" w-4 ml-2ame="h-4 ircle classN  <CheckC              w'}
  Create Escroting...' : 'Crea? 'ing ittubm     {isS        >
            "
         xt-whiteteg-green-700 -600 hover:breen"bg-gclassName=                 
 bmitting}isSusabled={      di            eSubmit}
ndlick={ha      onCl   
         tton         <Bu(
       :        ) on>
             </Butt      >
    ml-2" /4 w-4 me="h-t classNa<ChevronRigh         t
          Nex          >
                       e"
t-whitle-700 texurper:bg-p-600 hovurplee="bg-p    classNam            p}
  ={nextSteonClick               on
     <Butt             1 ? (
  length -ep < steps.rrentSt {cu          

   on></Butt              Previous
             -2" />
   -4 mrName="h-4 w classvronLeft<Che                 >
         
    ate-700"r:bg-sl00 hovetext-gray-300 r-slate-6bordelassName=" c               === 0}
 tStep={currenisabled    d            Step}
ev{pronClick=        
        "outline"riant=        va
        utton      <B>
        8"n mt-fy-betweeex justiassName="fl    <div cl     }
   uttons */on B Navigati   {/*
         ce>
imatePresen</An      
      n.div></motio               )}
              
 div> </             iv>
        </d                      )}
               
  </div>                       v>
        </di          
        )}         )                    </span>
                        }
     me    {file.na                          ">
  -300 blocksm text-graye="text-ssNam} clan key={index<spa                            ) => (
  ndex((file, iceFiles.mapenata.evidformD {                        ">
   e="mt-1iv classNam   <d                  span>
     ">Files:</00ray-4text-gssName=" cla  <span                     iv>
            <d              0 && (
  ngth >iles.leceF.evidentamDaor    {f           >
            </div              /p>
   }<requirements{formData.">xt-smte mt-1 te"text-whiName=ss    <p cla               >
     ents:</span">Requiremt-gray-400="texassName   <span cl                    div>
   <                   v>
       </di          
      on}</p>scriptimData.defor>{-1 text-sm"hite mt"text-w=lassName     <p c            
       :</span>Description400">"text-gray- className=       <span      
           v>   <di                  }
     )            v>
            </di            >
      span)}</g(caleStrin.toLoa.deadline)te(formDatDanew -white">{"text className=an<sp                  n>
        </spadline:>Dea"ay-400"text-gr className=       <span                ">
   betweenstify- juexme="fllassNadiv c        <          
      && (adline ata.demD  {for                    </div>
                     
 n>L</spaunt} SOformData.amot-mono">{xt-white fonsName="tespan clas     <               
    </span>mount:0">Axt-gray-40Name="te <span class                       >
n"ify-betweex justame="flediv classN   <                 div>
   </                   pan>
  Address}</sera.sellmDat">{forfont-monoxt-white ame="tessNclaan          <sp     
          /span>r:<Selle-400">t-grayame="texan classN        <sp            n">
    tify-betweeflex jussName="iv clas        <d    
          -y-3"> space p-4ounded-lg800 rte-me="bg-slaNadiv class  <                       
         >
            </div            
  w</p> escrocreating there ils befotall deeview aease rsm mb-4">Pltext-gray-400 Name="text-ass   <p cl                   >
</h3ilsw Detaeview Escro">Rb-2t-white mld texemibot-lg font-s"texe=lassNam    <h3 c                  iv>
    <d               ">
 y-4ce-"spasName=div clas           <       && (
 === 3 epSt  {current        }
      */w tep 3: Revie{/* S                 )}

            /div>
              <
         </div>                   )}
                 /div>
              <         
       ))}                      .div>
  otion</m                  
          </Button>                        />
      -4" 4 we="h-sNam     <X clas                    
           >                 "
         ext-red-30000 hover:ted-4text-rsName="    clas                           ex)}
 ndoveFile(i() => remonClick={                        
        e="sm"     siz                         ghost"
  iant="ar      v                      on
    utt <B                             >
/spane.name}<">{filgray-300-sm text-="textNameclass    <span                           
          >            "
      edround2 00 p-g-slate-8ween btify-bet-center juslex itemsssName="f  cla                  
          1, y: 0 }}{{ opacity:     animate=                 
         }}, y: 10 acity: 0itial={{ op          in                 ndex}
      key={i                   
        otion.div          <m                 (
  ex) =>nd i(file,ceFiles.map(viden {formData.e                    ">
     3 space-y-2mt-me="<div classNa                 (
        0 &&s.length > FilencermData.evidefo       {              

 div>  </motion.                    />
               
         Upload}={handleFile   onChange                      en"
 ame="hiddssN        cla                   multiple
                     file"
    ype="        t                  }
leInputRef     ref={fi                ut
             <inp                  </p>
                      nd drop
 aragor dence files oad referick to upl         Cl            m">
     -s400 textay-xt-gr="tesName   <p clas                   
  o mb-2" />-400 mx-autgrayxt-8 w-8 teame="h-sNload clas     <Up                     >
                    lick()}
current?.ceInputRef.fil() => lick={      onC             }}
      980. scale: {{p=     whileTa             }}
       : 1.02scale{{ ver= whileHo                      ors"
 sition-colan0 trrple-60er-puorder:ber hovsor-pointcurt-center -6 texrounded-lg pr-slate-600 shed borde2 border-da"border-ssName=        cla                on.div
     <moti          el>
         </lab                 l)
   Optionailes (eference F  R                    -2">
  -300 mb text-grayt-mediumext-sm fonock tblclassName="  <label                  
   div>          <
          } */oadce Uplviden      {/* E            iv>

     </d                  )}
                     on.p>
     </moti               ments}
    uirerors.req    {er              
        4 w-4" />="h-sNameasCircle cl      <Alert                   >
                        
 r gap-1"tems-cente-1 flex ixt-sm mt400 text-red-me="te   classNa                        y: 0 }}
y: 1,={{ opacit animate                     
    -10 }} 0, y: city:tial={{ opani    i              
          <motion.p                     ts && (
 requiremen    {errors.                />
                       
 rple-600"s:ring-puing-2 focu:rcusne-none fos:outli-400 focuext-grayceholder:t plawhitet-exrounded-md tte-600 r border-sla-800 bordeg-slate bpx-3 py-2w-full h-24 assName="        cl                
ue)}al.target.vments', e'requireChange(nputdleI=> han) ge={(enChan    o               ents}
     .requiremue={formData val                "
       letion...task compr s fontequiremeecific rsper="List ehold   plac             a
        extare          <t          /label>
       <              ents
   quiremletion Re      Comp            >
      b-2"-gray-300 mium textnt-medm fo text-sckblo="lassName   <label c                  
      <div>            >

    </div          
               )}            
    ion.p>     </mot                 }
  ions.descript   {error                      4" />
 "h-4 w-Name=lasslertCircle c         <A                >
                      "
    gap-1ntertems-cemt-1 flex i-sm extred-400 te="text-amclassN                  
        } y: 0 }ty: 1,ate={{ opacianim                 }
          y: -10 }: 0,{ opacity  initial={                   on.p
           <moti           (
        cription &&rs.des      {erro            >
         /            "
     purple-600us:ring-:ring-2 focfocusone -nine:outly-400 focustext-graeholder:white placext-md tunded-ate-600 roborder-slder -800 borslate py-2 bg-l h-24 px-3fulw-"className=                   )}
     luet.vatarge', e.riptionChange('deschandleInpute={(e) =>      onChang               on}
    a.descriptimDatalue={for        v           
     ..."mpletedce to be coervi or sthe taske er="Describacehold      pl             rea
     xta      <te      
          l>   </labe               iption
    Task Descr                  >
      y-300 mb-2"ram text-gdiuont-me fxt-sm"block tesName=label clas       <                 <div>
                  
                  /div>
            <        /p>
  mpleted<o be co tedse what neDefinmb-4">t-sm ext-gray-400 ttex=" className          <p          h3>
  s</equirement& Rms ">Ter-2t-white mbemibold text-lg font-ssName="tex clas      <h3       
         <div>            
        -4">space-yme="assNa <div cl        (
         &  & 2tStep === {curren        
       ements */}rms & Requir* Step 2: Te  {/             )}

           v>
          </di              </div>
           
                />         "
      ite text-wh-slate-600 borderlate-800bg-sName="  class                    }
  rget.value)e.taine', 'deadlputChange(> handleIne) =ange={(      onCh               adline}
   Data.deue={form      val          "
        e-localetime="dat     typ                 put
    <In            
        el>   </lab                  
 )(Optionalline ad   De                 ">
    00 mb-2gray-3um text- font-mediock text-sm"blssName=lalabel c         <             div>
     <                 </div>

                  )}
                  
    .p>ion     </mot             
      rors.amount}   {er                       4 w-4" />
e="h-amrcle classNlertCi         <A           
        >                    p-1"
   gaitems-centert-1 flex t-sm mtexd-400 e="text-reassNam          cl          0 }}
      y: 1, y: pacitte={{ oanima                     }}
      y: -10opacity: 0, {{ tial=     ini              
       <motion.p                   
     && (mount    {errors.a                           />
        e"
       text-whiter-slate-600bordate-800 Name="bg-slclass                     }
   lue)vaarget.e.t', e('amountputChangleInndha=> ge={(e)  onChan                 }
      ata.amountue={formD      val              0"
    der="0.hol   place               "
      01ep="0.0   st              
       er"umbe="n  typ                   ut
   np      <I                  </label>
                  OL)
  nt (S    Amou              ">
      -300 mb-2-grayextdium tnt-mext-sm fo"block teName=ass  <label cl              
            <div>               
               /div>
              <
          p>his escrow</amount for tment the payb-4">Set 0 text-sm my-40"text-graame=classNp      <             
    t</h3>row Amoun2">Escb-xt-white m-semibold tefonte="text-lg classNam       <h3                 <div>
                  
 ce-y-4">e="spaiv classNam        <d         
  (&&ep === 1 ntStre {cur          */}
      Amount1:   {/* Step    
              )}
        >
     iv      </d  
          div>        </         }
           )            
  p>tion.   </mo               
      s}ddresrs.sellerAerro           {              -4" />
 h-4 wlassName="e ctCircl<Aler                        >
                     "
     -1s-center gapex item-1 flxt-sm mtt-red-400 teName="texlass     c              
        0 }} y:ty: 1,ciate={{ opa  anim                        
 }}, y: -10 opacity: 0initial={{                        n.p
  otio      <m                 
 && (ss lerAddre.sel    {errors                      />
                hite"
  600 text-wder-slate- bor00ate-8ame="bg-slsN        clas             value)}
   rget..ta', eesslerAddrselutChange('ndleInp> hae) =={(nChange    o                
    ss}lerAddreormData.selvalue={f                    le"
    s or @handlet addresEnter wal="placeholder                      ut
  <Inp                      bel>
       </la            Handle
   ss/ler AddreSel                        
-300 mb-2">rayedium text-gm font-mk text-se="bloc classNam <label                    <div>
                             
        
    v>di </           p>
        r handle</ address oalleteller's wnter the s mb-4">Esm400 text-t-gray-ssName="tex   <p cla                  tion</h3>
 ler Informa-2">Selmbite xt-whsemibold teont-lg ftext-ame="classN     <h3              
    div>  <           ">
       "space-y-4sName= <div clas                 === 0 && (
rentStep    {cur             */}
 Detailsller  Se {/* Step 0:                >
             "
h-[300px]min-Name="       class        }}
 3 ation: 0. durn={{itio       trans     
     }}20 0, x: -city:pa={{ oit     ex           , x: 0 }}
city: 1te={{ opama      ani           x: 20 }}
ty: 0,{ opaciitial={in               tep}
 rentS key={cur            n.div
     <motio           "wait">
  mode=ncePrese<Animate         ">
   "p-6Name=nt classardConte        <Cer>

  /CardHead        </div>
    <          
iv>/d        <       </div>
           
             />}
         %' }dth: '20 style={{ wi                  }}
                 "
    nOut "easeIse:       ea           ity,
    epeat: Infin r                
     n: 2,   duratio         
          ansition={{    tr        }}
                            ,
 10}%`]centage -sPer{progres `$0}%`,ntage + 1ssPercegre{pro`$, 10}%`centage - gressPer`${pro        x: [           e={{
    animat              ull"
     rounded-fbg-white/20 full  left-0 h-p-0lute to"abso className=                 tion.div
  mo     <       >
         /          }
     " } "easeInOut5, ease:on: 0.on={{ durati transiti             }
      e}%` }rcentagPe`${progressth: id{ wnimate={   a              h: 0 }}
   tial={{ widt        ini            full"
 rounded-to-cyan-600e-600  from-purpladient-to-rbg-grull t-0 h-flefolute top-0 ssName="absla       c      div
       motion.     <             hidden">
w-ll overfloded-fu roun-700g-slate h-2 blativeName="relass    <div c          r */}
  ress Ba ProgphingMor*       {/  
                   
     div>       </         })}
              );
                  
      on.div></moti             
            </span>               
      .title}      {step                  `}>
  400'}-gray- : 'texttext-white' 'ive ?sAct-1 ${iext-xs mt`tclassName={pan  <s                
       ion.div>    </mot             
        )}                  
       -5" />ame="h-5 wIcon classN       <                    ) : (
                           " />
w-5sName="h-5 clasCircle Check       <                   d ? (
   {isComplete                        >
                        .05 }}
  scale: 1={{ver    whileHo                        }`}
                       ay-400'
 -600 text-grlate700 border-sslate- 'bg-         :                
     white'xt-e-600 teorder-purplpurple-600 b? 'bg-                     
         Active   : is                          white'
 ext--green-600 terbordeen-600 bg-gr     ? '                         Completed
        is                   
 ${uration-300 all d transition-border-2center ter justify-tems-cenl flex i rounded-ful h-10`w-10ssName={         cla                
 iv   <motion.d                        >
           
                 }}            1 : 1,
   tive ? 1.: isAc     scale                     ={{
   animate                 lse}
    tial={fa        ini     
           s-center"lex-col item"flex f  className=                  
    p.id}y={ste    ke             div
          <motion.               rn (
          retu         
                  
       urrentStep;ndex < completed = i isC      const              rrentStep;
x === cuctive = indet isAons        c        icon;
    ep. Icon = stnst   co                 
) => {(step, indexps.map(   {ste              ">
 mb-2een -betwify justexssName="fl<div cla             ">
   Name="mb-6iv class        <d*/}
      ess Bar    {/* Progr    >

           </div       
   >Button </         />
      "h-5 w-5"  className=  <X             
            >"
       :text-whiteverhot-gray-400 texclassName="                 Cancel}
 {on   onClick=           
    icon""ze=       si       
    ghost" variant="               ton
       <But      
     itle></CardT New Escrow">Createe text-xlt-whit="texassNamee cltldTi<Car               4">
 b-tween mify-ber justnteitems-ceme="flex lassNa      <div c">
        lative z-10re="classNamediv        <
                />
             }}
 %'e: '200% 200ackgroundSizyle={{ b st        }}
                 
  "ear ease: "lin            inity,
   epeat: Inf     r           tion: 8,
   dura           ={{
    transition   
                  }},
     ', '0% 50%'], '100% 50% ['0% 50%'n:roundPositio  backg          ={{
       animate         
  20"e-600/urpl0/20 to-pcyan-600/20 via-purple-60t-to-r from--gradienet-0 bg insoluteame="abs   classN        .div
   otion          <m  nt */}
gradiekground bacAnimated         {/* ">
    iddenow-hoverfllative assName="re clader<CardHe        l">
  2x0 shadow--70der-slateorlate-900 bsName="bg-srd clas   <Ca      >
   l"
   max-w-2xulle="w-f    classNam
    0 }}9, y: 2cale: 0.ity: 0, s={{ opac   exit}}
     : 0 , y scale: 1opacity: 1,imate={{  an       0 }}
 0.9, y: 2scale:opacity: 0, itial={{      in
   otion.div<m">
      -50 p-4nter z justify-ce-centerx items-sm fleackdrop-blurlack/80 bg-binset-0 bme="fixed v classNa(
    <din 

  retur0;10) * ngtheps.le + 1) / sttStepurren= ((cge ssPercentat progre
  cons
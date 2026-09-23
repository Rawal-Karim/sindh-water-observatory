
/* Sindh Water Observatory — standalone Google Earth Engine Code Editor app.
 * Run in your registered project; no service-account key belongs in this file.
 * Boundary: geoBoundaries gbOpen PAK ADM1, public domain, PAK-ADM1-70912109.
 * Water thresholds follow the extracted Kotri Bund Risk Monitor: MNDWI > 0; VV < -17 dB. Not a flood alert system.
 */
var region = ee.Geometry({"type": "Polygon", "coordinates": [[[66.68992751384377, 24.914246073097843], [66.67194467470705, 24.87773489395022], [66.67648048998268, 24.853042874029484], [66.70218344141273, 24.83520668284217], [66.73242220811846, 24.832462425000983], [66.77929229660225, 24.83520668284217], [66.82767432261193, 24.83520668284217], [66.88210410322182, 24.821484785694338], [66.92595031485519, 24.79678154223444], [66.95770101998613, 24.781682692202537], [66.99398753949339, 24.781682692202537], [67.02573824462434, 24.785800742710137], [67.05144119605438, 24.80089909092038], [67.08016802433491, 24.781682692202537], [67.09679934611302, 24.75971744910106], [67.1330858665196, 24.73225543274208], [67.14518137302201, 24.719895547141846], [67.17239626287727, 24.71714873882331], [67.18297983095448, 24.693798423758324], [67.16634851007575, 24.64708466622443], [67.16483657165054, 24.61959781778512], [67.16634851007575, 24.568731218570917], [67.16483657165054, 24.53159931205863], [67.18902758465538, 24.495832277837394], [67.23136185786353, 24.444915493755104], [67.25706480929358, 24.41050061181386], [67.26764837827011, 24.389847177405386], [67.27823194634732, 24.33062196163428], [67.29486326812537, 24.30857759887715], [67.30242295935216, 24.22587713692036], [67.31603040427979, 24.154159922442545], [67.34626917098552, 24.07273969488108], [67.3734840617401, 24.02303413931412], [67.41884221089936, 23.9594935096178], [67.46268842253272, 23.906979790385094], [67.51863014156783, 23.86412384114243], [67.5670121675775, 23.830935298125553], [67.6305135778394, 23.80188835526343], [67.66377622139555, 23.803271690636052], [67.70157467932802, 23.80188835526343], [67.73483732288418, 23.792204597564194], [67.75902833588907, 23.779752990108477], [67.79985067157128, 23.76868389424635], [67.82404168457612, 23.76868389424635], [67.84369688320464, 23.78943767680738], [67.85579238970706, 23.841999089786214], [67.86637595778427, 23.86688916919985], [67.8860311564128, 23.86412384114243], [67.89056697078911, 23.833701334848797], [67.90266247819085, 23.803271690636052], [67.95255644262579, 23.764532740593552], [67.98884296303237, 23.741007034347206], [68.0175697913129, 23.731318744064822], [68.04024886589252, 23.738239025410735], [68.04629661959336, 23.756230035787553], [68.04629661959336, 23.808804883738446], [68.05083243486905, 23.833701334848797], [68.05839212609578, 23.84891348057272], [68.07199957102341, 23.84753063173332], [68.07955926314952, 23.82955225773054], [68.11735772108204, 23.825403048412], [68.14759648778772, 23.828169202946412], [68.16725168641625, 23.843381997980885], [68.19446657627151, 23.84891348057272], [68.21563371242593, 23.86688916919985], [68.24738441755687, 23.869654438801376], [68.26855155461061, 23.879332415658496], [68.27459930741219, 23.893156841814857], [68.28518287638872, 23.90145078812344], [68.3320529648725, 23.908362004303115], [68.33961265609923, 23.941530693886477], [68.36077979315297, 23.962256797113525], [68.37892305245697, 23.967783195837853], [68.39555437423502, 23.958111843386916], [68.39706631266023, 23.944294367191333], [68.43032895621639, 23.937385073762186], [68.53918851653685, 23.94014883520066], [68.69189428759137, 23.941530693886477], [68.75388375942799, 23.94567618091105], [68.75690763627847, 23.96916475864674], [68.75085988257757, 24.23414960382121], [68.75993151312889, 24.276882116616434], [68.82040904564099, 24.275503872305933], [68.8385523058443, 24.26034220283043], [68.83704036741909, 24.21898300336295], [68.85971944289804, 24.209330590634295], [68.8778627031013, 24.2134674288788], [68.88844627117851, 24.22863468584211], [68.8960059624053, 24.250692925138424], [68.90810146980704, 24.26447738272509], [68.92775666753624, 24.271369051240754], [68.94136411246387, 24.26309900441555], [68.94892380458998, 24.242421533826757], [68.9700909407444, 24.21898300336295], [69.00788939957619, 24.21760413222495], [69.02452072135424, 24.221740701572173], [69.04266398065823, 24.231392174509324], [69.05929530243634, 24.24655729648208], [69.0834863163405, 24.256206888037525], [69.10314151406965, 24.24655729648208], [69.13338028077538, 24.236906973777877], [69.2089771975397, 24.22863468584211], [69.24223984109585, 24.238285636273133], [69.25433534759827, 24.25344993626561], [69.30271737450727, 24.257585340990772], [69.39343367462442, 24.256206888037525], [69.44635151590978, 24.25344993626561], [69.47205446733983, 24.236906973777877], [69.53404393917651, 24.239664283479954], [69.58242596608551, 24.26999074757498], [69.60056922628883, 24.271369051240754], [69.62022442401803, 24.257585340990772], [69.64139156107171, 24.22587713692036], [69.68070195742945, 24.196919270108253], [69.69582134078229, 24.169334234587325], [69.72757204591323, 24.15829855033786], [70.03147165049631, 24.154159922442545], [70.06473429405247, 24.161057560657923], [70.0783417389801, 24.176231052621006], [70.09194918390779, 24.20657262352779], [70.09950887603384, 24.23552829599413], [70.11462825938673, 24.26034220283043], [70.12823570431436, 24.2782603456385], [70.18568936087536, 24.2865294059074], [70.2068564979291, 24.29893198592248], [70.27640566099251, 24.31408904907039], [70.30059667399735, 24.32786662594407], [70.3429309472055, 24.33062196163428], [70.38828909726408, 24.340265164405878], [70.45330244595118, 24.36368131434125], [70.50773222566175, 24.389847177405386], [70.55762619099596, 24.392601164112477], [70.58030526557559, 24.378830631628375], [70.58484108085128, 24.34302023029943], [70.5818172040008, 24.316844684234866], [70.57425751277407, 24.2865294059074], [70.57123363592359, 24.256206888037525], [70.5818172040008, 24.23414960382121], [70.62112760035853, 24.210709551704497], [70.68916482589606, 24.209330590634295], [70.77383337231231, 24.20105651124902], [70.85094222750183, 24.2134674288788], [70.87362130208146, 24.230013437370303], [70.89327650070999, 24.24655729648208], [70.9114197609133, 24.287907529708775], [70.92653914426614, 24.307199699006958], [70.94014658919377, 24.320978024116584], [70.97492117117514, 24.336132453150242], [71.05505390231582, 24.337510038257733], [71.07470910094429, 24.347152716724565], [71.08831654587198, 24.374699179423658], [71.10645980607524, 24.389847177405386], [71.10797174450045, 24.409123820807736], [71.1004120523744, 24.42013772527588], [71.0202793203344, 24.42839752252769], [70.99911218418004, 24.468312248911218], [70.99608830732956, 24.49995976223329], [70.99608830732956, 24.523346284903198], [70.99288299855158, 24.552669579537508], [71.00546232502631, 24.60986602459741], [71.06255311683293, 24.649448252734715], [71.0664236784101, 24.665277632856544], [71.05771491351248, 24.708358545710382], [71.0306209788751, 24.73912150565303], [71.02771805724262, 24.760211709303007], [71.0228798548215, 24.777784144622615], [70.95375403412146, 24.880478147248766], [70.93561077391814, 24.91339243481309], [70.91897945214004, 24.939443352828505], [70.91444363776372, 24.976453603551022], [70.9038600687872, 25.00249118192255], [70.89327650070999, 25.02030318854139], [70.8857168094832, 25.118907475599542], [70.86908548770515, 25.146283456516358], [70.83128702887336, 25.175021629744492], [70.76778561951079, 25.22837454864657], [70.74208266718142, 25.254358522028213], [70.71789165417658, 25.281704068987665], [70.71637971575132, 25.304942939165358], [70.7042842092489, 25.33227708092261], [70.64985442953832, 25.380096975794856], [70.64229473741227, 25.411511174401255], [70.64078279898706, 25.475679959862305], [70.64229473741227, 25.606641710246777], [70.64078279898706, 25.654352561421604], [70.63624698371137, 25.684332478960812], [70.62566341563416, 25.69523239705751], [70.61054403228133, 25.707493612640178], [70.57879332715038, 25.710218155543487], [70.56216200537233, 25.707493612640178], [70.54553068449354, 25.69523239705751], [70.50924416408697, 25.691145044907955], [70.42911143204702, 25.687057551564806], [70.27640566099251, 25.692507511512474], [70.24767883271204, 25.70068198198794], [70.24163107901114, 25.73746015456254], [70.22953557250872, 25.755164106738164], [70.2008087442282, 25.78648001843817], [70.16905803909731, 25.805537830706385], [70.14789090294289, 25.825953514043476], [70.12823570431436, 25.847726362481694], [70.08892530795663, 25.883098694149453], [70.06171041720205, 25.929338835418946], [70.05868654125095, 25.986433966454456], [70.04356715789805, 26.00545951914154], [70.03751940419721, 26.047576560210132], [70.06019847877684, 26.089678474681932], [70.08892530795663, 26.137194692780895], [70.10404469130953, 26.156195769519172], [70.11765213623715, 26.184691581751167], [70.12521182746394, 26.215893287645144], [70.11916407376305, 26.248442670792656], [70.11916407376305, 26.274204468461505], [70.14486702609241, 26.32842113942411], [70.13730733396636, 26.52339078475694], [70.12823570431436, 26.546386251624256], [70.10555662883542, 26.566672541404728], [70.07531786212968, 26.573433839699987], [70.03751940419721, 26.597771210173278], [70.01181645276716, 26.60453067205293], [69.96948217955901, 26.596419269233934], [69.94377922722958, 26.58289898749831], [69.91958821422475, 26.573433839699987], [69.85608680396291, 26.57749042784104], [69.82282416130607, 26.57749042784104], [69.76990631912139, 26.580194739595584], [69.73361979961413, 26.60047504258921], [69.6549990059994, 26.66399671097946], [69.63383186894566, 26.672103317714004], [69.59452147258793, 26.68426214728032], [69.56428270588225, 26.705874641201774], [69.53404393917651, 26.712627705304385], [69.48566191226752, 26.73423481768276], [69.45693508398699, 26.75988793318163], [69.45542314556178, 26.91907748253982], [69.46600671453831, 26.99858821827172], [69.48263803631636, 27.024181417338582], [69.49624548124405, 27.060540671314982], [69.49775741966926, 27.102271949091232], [69.5219484326741, 27.148023858314446], [69.56125882903177, 27.185687840621426], [69.59300953416272, 27.23006121325443], [69.68674971113035, 27.303977542629525], [69.73966755241565, 27.356361135358156], [69.79863314740192, 27.387242416404433], [69.82735997568238, 27.41677296609953], [69.85155098958654, 27.446295622445064], [69.89690913964512, 27.49727069428718], [69.93621953600285, 27.548222171516045], [69.96041054900769, 27.56966835920747], [69.98308962448664, 27.596470200339525], [70.00274482221585, 27.629963288874706], [70.03298358892152, 27.71030488216462], [70.04356715789805, 27.74510121604834], [70.06927010932816, 27.77453558954585], [70.11141199147028, 27.833501127874797], [70.10555662883542, 27.850760323929876], [70.08590143110621, 27.874820173512262], [70.05415072597526, 27.877493160081315], [70.03449552734679, 27.886848095063613], [70.00879257591669, 27.90555553865721], [69.98157768606143, 27.930939040104647], [69.95889861058248, 27.948303264384208], [69.94529116655417, 28.005718881421274], [69.92714790545153, 28.017732234854805], [69.9105165845728, 28.037751512322473], [69.85911068081333, 28.068440502127544], [69.84247935903522, 28.10312185229168], [69.8394554821848, 28.217757196037837], [69.83491966780849, 28.245730885272167], [69.81677640760518, 28.26171255658926], [69.80770477795318, 28.276360317474712], [69.80619283952797, 28.305649795801514], [69.80014508582713, 28.333600414727414], [69.78956151774992, 28.35489119147536], [69.78956151774992, 28.382828856566505], [69.76990632002071, 28.396129921358806], [69.74722724454176, 28.39878993340875], [69.73361979871481, 28.409429316110106], [69.71547653941082, 28.42006763041684], [69.65802288284982, 28.422727041719668], [69.62778411614408, 28.422727041719668], [69.61266473279125, 28.43336401873455], [69.59603341101314, 28.451976157573654], [69.58393790451072, 28.461280999418648], [69.55672301465546, 28.470585021081888], [69.50985292527236, 28.470585021081888], [69.47205446733983, 28.46659768343642], [69.44635151590978, 28.440011587864547], [69.41913662605452, 28.42006763041684], [69.40326124561005, 28.42006763041684], [69.40401724270163, 28.41208899541084], [69.36621878386984, 28.400119914702373], [69.08046243949002, 28.400119914702373], [69.00032970745008, 28.396129921358806], [68.95799543424198, 28.388149483212146], [68.85518362762235, 28.382828856566505], [68.79319415578573, 28.382828856566505], [68.66467939773605, 28.37484741747437], [68.56942728234327, 28.373517118720088], [68.52860494845964, 28.368195759127047], [68.5149975026327, 28.352230077755962], [68.48778261277744, 28.3269461726278], [68.47115129189865, 28.32295342645949], [68.46963935347344, 28.304318631000058], [68.4575438460717, 28.279023330562325], [68.44544833956928, 28.27103409165005], [68.44393640114407, 28.24839466278354], [68.43184089464165, 28.224418263092446], [68.40613794231223, 28.207098624501953], [68.34414847137492, 28.203101386220055], [68.31693358062029, 28.199103997751365], [68.29123062919024, 28.187110936620456], [68.2670396161854, 28.171118094824294], [68.24133666385603, 28.15645588902811], [68.21412177400072, 28.133792165875832], [68.18085913134388, 28.101788161294678], [68.1415487349862, 28.077778890483444], [68.10375027615436, 28.05109562766114], [68.05990406452099, 28.02307107277187], [68.03268917466573, 28.003049065861774], [67.98430714775674, 27.942960723058945], [67.95860419542731, 27.929603214117094], [67.86335208093385, 27.90689166142107], [67.85579238970706, 27.894865966591112], [67.83916106792901, 27.861454249613985], [67.80438648594765, 27.861454249613985], [67.75902833588907, 27.86412756623423], [67.69099111125087, 27.86412756623423], [67.65621653016876, 27.85744415102681], [67.63504939311508, 27.842739187863287], [67.60632256483456, 27.826695135072498], [67.58364348935561, 27.825358023953697], [67.53677340177114, 27.83070637040271], [67.50955851191583, 27.838728396798103], [67.48234362206057, 27.838728396798103], [67.46420036095793, 27.833380445151477], [67.45210485535483, 27.75045351231978], [67.42942577987588, 27.74510121694766], [67.42791384145067, 27.72368940224419], [67.42791384145067, 27.67951425367994], [67.40221089002063, 27.64335765563135], [67.37953181454168, 27.635321231989337], [67.35836467748794, 27.58843033589136], [67.34173335660915, 27.56564751821844], [67.32207815798068, 27.55224365102373], [67.30998265057895, 27.510681265927758], [67.28881551532385, 27.48385848767913], [67.260088686144, 27.462395560906486], [67.23892154998958, 27.431535280828598], [67.23136185786353, 27.372474183237046], [67.23438573471395, 27.29054186641406], [67.21775441293585, 27.25828961117668], [67.20112309205712, 27.23543860330892], [67.20112309205712, 27.133223817924886], [67.23136185786353, 27.07400407183053], [67.22984992033759, 27.032262268389047], [67.23136185786353, 26.974336654812817], [67.22380216573742, 26.94064526126982], [67.2086827832839, 26.921773679711578], [67.202635029583, 26.906943794420613], [67.20112309205712, 26.75043745872182], [67.202635029583, 26.709926527687173], [67.1980992152067, 26.66534785242152], [67.18449176937969, 26.645079057152827], [67.17542013972775, 26.620751751891873], [67.17542013972775, 26.595067313006155], [67.19053952308059, 26.54909129722563], [67.1996111536319, 26.534212755913984], [67.21019472170912, 26.457083966352002], [67.22229022731221, 26.44354726569378], [67.22984992033759, 26.421885236214735], [67.23740961156437, 26.390738938451307], [67.2570648101929, 26.358229495095145], [67.29486326812537, 26.31351408330835], [67.31300652832869, 26.276915904645307], [67.34929304783594, 26.22810037483248], [67.36592436961405, 26.18062117822484], [67.38709150576841, 26.13855201526337], [67.3991870131702, 26.099183263696716], [67.42035414932457, 26.07609886557026], [67.43849740952788, 26.05029326911915], [67.45966454658162, 26.025840619948724], [67.46268842343204, 25.990511129285267], [67.45966454658162, 25.883098694149453], [67.44908097760509, 25.853168948887912], [67.45512873130593, 25.81234344939071], [67.45966454658162, 25.764695910487944], [67.4566406697312, 25.72111570482599], [67.42791384145067, 25.691145044008636], [67.41279445809784, 25.680244752693227], [67.39616313631973, 25.640722834890994], [67.38406762981731, 25.62709155253316], [67.36592436961405, 25.610731958213364], [67.34778110941073, 25.590279317236764], [67.34022141818394, 25.554819790900694], [67.33114978763263, 25.535721850882737], [67.29939908250174, 25.528900420318166], [67.29032745284974, 25.522078603045145], [67.28579163847337, 25.5029754496573], [67.27520806949684, 25.49205799837796], [67.23740961156437, 25.47022011816398], [67.21926635136106, 25.44837827283908], [67.211706659235, 25.42789794443462], [67.1860037078049, 25.384194943541843], [67.18449176937969, 25.35687253164207], [67.17390820130248, 25.29810843965282], [67.15727687952443, 25.280336937599657], [67.14971718829764, 25.24068343908948], [67.1361097424707, 25.22837454864657], [67.12250229844238, 25.199648958732496], [67.09831128453823, 25.187335917019027], [67.05900088818049, 25.158600645903164], [67.02573824462434, 25.124383162453057], [67.01515467654713, 25.097002273036537], [67.01364273812192, 25.06139795405238], [67.00457110846992, 25.028523242953327], [66.98642784826666, 25.00797207495134], [66.96526071121292, 24.99426938462443], [66.93502194450718, 24.991528663816837], [66.89873542499993, 24.991528663816837], [66.86849665829419, 24.98741746704252], [66.85640115089245, 24.97508305204127], [66.84884145966566, 24.95589372741364], [66.8246504457615, 24.94766881396464], [66.79743555590625, 24.94629794229627], [66.74905352989657, 24.920248473088634], [66.72032670161605, 24.910649912663416], [66.68992751384377, 24.914246073097843]]]});
var RGB = ['B4', 'B3', 'B2'];
var WATER_TEXTURE_ASSET = 'projects/ee-rawal-karim23/assets/sindh_synthetic_water_texture_20260922';
var visRGB = {bands: RGB, min: 0, max: 3000, gamma: 1.3};
var left = ui.Map(), right = ui.Map();
left.setOptions('SATELLITE'); right.setOptions('SATELLITE');
left.setCenter(68.5, 26.1, 7); right.setCenter(68.5, 26.1, 7);
var linker = ui.Map.Linker([left, right]);
var split = ui.SplitPanel({firstPanel: left, secondPanel: right, orientation: 'horizontal', wipe: true, style: {stretch: 'both'}});
var panel = ui.Panel({style: {width: '340px', padding: '22px', backgroundColor: '#f7faf7'}});
ui.root.clear(); ui.root.setLayout(ui.Panel.Layout.flow('horizontal'));
var controlsVisible = true;
ui.root.add(ui.Button({label: '☰', onClick: function() {controlsVisible = !controlsVisible; ui.root.widgets().get(1).style().set('shown', controlsVisible);}, style: {width: '32px', margin: '4px'}}));
ui.root.add(panel); ui.root.add(split);
panel.add(ui.Label('SINDH WATER OBSERVATORY', {fontWeight: 'bold', fontSize: '21px', color: '#164e43'}));
panel.add(ui.Label('Google satellite reference ← swipe → satellite + surface changes'));
var locations = {'Entire Sindh': [68.5,26.1,7], 'Hyderabad close-up': [68.36,25.39,17], 'Manchar Lake': [67.67,26.43,13], 'Sukkur close-up': [68.85,27.69,17]};
panel.add(ui.Select({items: Object.keys(locations), value: 'Entire Sindh', onChange: function(name) {var p=locations[name];left.setCenter(p[0],p[1],p[2]);right.setCenter(p[0],p[1],p[2]);}}));
panel.add(ui.Label('Unchanged land keeps Google satellite detail at every zoom. Water appearance is synthetic. Dry-area fill uses historical Sentinel pixels; it cannot match close-up satellite detail.', {fontSize: '12px', color: '#5d7167'}));
var waterLayer, dryLayer;
var waterOpacity = ui.Slider({min: 0, max: 1, value: 1, step: 0.05, onChange: function(value) {if (waterLayer) waterLayer.setOpacity(value);}});
panel.add(ui.Label('Water appearance opacity')); panel.add(waterOpacity);
var showDry = ui.Checkbox({label: 'Fill recently dried areas (lower resolution)', value: true, onChange: function(value) {if (dryLayer) dryLayer.setShown(value);}});
panel.add(showDry);
panel.add(ui.Label('Dry patches mark water in the preceding year’s latest valid optical observation before this window, now classified dry. Google reference dates are unknown; this is not a change map against Google imagery.', {fontSize: '11px', color: '#5d7167'}));
var date = ui.Textbox({placeholder: 'YYYY-MM-DD', value: new Date().toISOString().slice(0, 10)});
panel.add(ui.Label('Observation window ends (UTC, inclusive)')); panel.add(date);
var days = ui.Select({items: ['14', '24', '30', '60'], value: '24'});
panel.add(ui.Label('Look-back window in days')); panel.add(days);
var method = ui.Select({items: ['Sentinel-2 MNDWI', 'Sentinel-1 VV threshold'], value: 'Sentinel-2 MNDWI'});
panel.add(ui.Label('Water detection method')); panel.add(method);
var mndwi = ui.Slider({min: -0.2, max: 0.6, value: 0, step: 0.05, style: {stretch: 'horizontal'}});
panel.add(ui.Label('MNDWI threshold (green − SWIR) / (green + SWIR)')); panel.add(mndwi);
var vv = ui.Slider({min: 10, max: 25, value: 17, step: 0.5, style: {stretch: 'horizontal'}});
panel.add(ui.Label('Radar water threshold magnitude (17 means −17 dB)')); panel.add(vv);
panel.add(ui.Label('Radar mode uses ascending IW scenes, an incidence-angle mask and slope exclusion. It is a screening method, not calibrated classification.', {fontSize: '12px'}));
var status = ui.Label('Ready to analyze Sindh.', {whiteSpace: 'pre-wrap'});
var run = ui.Button('Analyze latest available observations', analyze);
panel.add(run); panel.add(status);
var exportPanel = ui.Panel(); panel.add(exportPanel);
panel.add(ui.Label('Copernicus Sentinel / ESA • Google Earth Engine • geoBoundaries', {fontSize: '11px', color: '#677e6b'}));
var generation = 0;
// Water (2026-09 rule; the web map's daily snapshot and single-day service use the same): MNDWI > t with SWIR < 0.15
// (bright roofs pass MNDWI but not dark SWIR) or, for channels narrower than a 20 m SWIR pixel, 10 m NDWI > 0 with
// NIR < 0.15 and SWIR < 0.15. Tested near Hyderabad/Kotri and Sehwan: built-up false water -95%, drains found 22->55% / 35->74%.
function waterRule(img, t) {
  var darkSwir = img.select('B11').lt(1500);
  return img.select('mndwi').gt(t).and(darkSwir).or(img.select('ndwi').gt(0).and(img.select('B8').lt(1500)).and(darkSwir));
}
function prepareS2(img) {
  var scl = img.select('SCL');
  var valid = scl.eq(4).or(scl.eq(5)).or(scl.eq(6)).or(scl.eq(7));
  var green = img.select('B3'), swir = img.select('B11');
  var sum = green.add(swir);
  var index = green.subtract(swir).divide(sum).rename('mndwi').updateMask(sum.gt(0));
  var time = ee.Image.constant(img.date().millis()).rename('time').toDouble();
  return img.select(['B4', 'B3', 'B2', 'B8', 'B11']).addBands(index).addBands(img.normalizedDifference(['B3', 'B8']).rename('ndwi')).addBands(time)
    .updateMask(valid).copyProperties(img, ['system:time_start']);
}
function prepareS1(img) {
  var angle = img.select('angle');
  var backscatter = img.select('VV');
  var valid = angle.gt(30).and(angle.lt(45)).and(backscatter.gt(-35));
  // Reduce speckle in linear power, then return to dB. Preserve original validity.
  var smooth = ee.Image(10).pow(backscatter.divide(10)).focalMedian(30, 'circle', 'meters').log10().multiply(10).rename('VV').updateMask(valid);
  return smooth.addBands(ee.Image.constant(img.date().millis()).rename('time').toDouble().updateMask(valid))
    .copyProperties(img, ['system:time_start']);
}
function outline(map) { map.addLayer(ee.Image().byte().paint(ee.FeatureCollection([ee.Feature(region)]), 1, 2), {palette: ['e4edc2']}, 'Sindh boundary'); }
function analyze() {
  var raw = date.getValue();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || isNaN(Date.parse(raw)) || new Date(raw).toISOString().slice(0,10) !== raw) { status.setValue('Enter a valid date as YYYY-MM-DD.'); return; }
  if (raw < '2020-01-01') {status.setValue('Choose a date from 2020 onward.'); return;}
  if (raw > new Date().toISOString().slice(0,10)) { status.setValue('Choose today or an earlier date.'); return; }
  var id = ++generation;
  var end = ee.Date(raw).advance(1, 'day'), start = end.advance(-Number(days.getValue()), 'day');
  var chosen = method.getValue(), opticalThreshold = mndwi.getValue(), radarThreshold = -vv.getValue();
  var allOptical = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED').filterBounds(region).filterDate(end.advance(-365, 'day'), end).map(prepareS2);
  var optical = allOptical.filterDate(start, end);
  var radar = ee.ImageCollection('COPERNICUS/S1_GRD').filterBounds(region).filterDate(start, end)
    .filter(ee.Filter.eq('instrumentMode', 'IW')).filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'))
    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV')).map(prepareS1);
  var source = chosen === 'Sentinel-2 MNDWI' ? optical : radar;
  run.setDisabled(true); exportPanel.clear(); status.setValue('Checking available scenes…');
  ee.Dictionary({source: source.size(), opticalHistory: allOptical.size()}).evaluate(function(counts, error) {
    if (id !== generation) return;
    if (error || !counts || !counts.source || !counts.opticalHistory) { run.setDisabled(false); status.setValue(error || 'No scenes available. Try a longer window or another date.'); return; }
    var latest = source.select(chosen === 'Sentinel-2 MNDWI' ? ['mndwi','ndwi','B8','B11','time'] : ['VV','time']).qualityMosaic('time').clip(region);
    var slope = ee.Terrain.slope(ee.Image('USGS/SRTMGL1_003'));
    var water = chosen === 'Sentinel-2 MNDWI' ? waterRule(latest, opticalThreshold) : latest.select('VV').lt(radarThreshold).updateMask(slope.lt(5));
    water = water.rename('water').clip(region);
    var valid = water.mask().rename('valid');
    var dry = allOptical.map(function(img) {return img.updateMask(waterRule(img, opticalThreshold).not());}).qualityMosaic('time').select(RGB);
    var historicalRGB = allOptical.qualityMosaic('time').select(RGB);
    // AI material affects appearance only. The measured mask controls every water pixel.
    var texture = historicalRGB.select('B3').divide(1800).clamp(0.6, 1.3).unmask(1);
    var material = ee.Image(WATER_TEXTURE_ASSET).select([0,1,2], RGB).resample('bilinear');
    var modeledWater = material.divide(255).pow(1.3).multiply(3000).multiply(texture).updateMask(water);
    var priorCollection = allOptical.filterDate(end.advance(-365, 'day'), start);
    var emptyPrior = ee.Image.constant([0, 0, 0, 0, 0]).rename(['mndwi','ndwi','B8','B11','time']).toDouble().updateMask(ee.Image(0));
    var prior = ee.ImageCollection([emptyPrior]).merge(priorCollection.select(['mndwi','ndwi','B8','B11','time']).map(function(img) {return img.toDouble();})).qualityMosaic('time');
    var receded = waterRule(prior, opticalThreshold).and(water.not()).rename('receded');
    var land = dry.updateMask(receded);
    var reconstruction = ee.ImageCollection([land.toFloat(), modeledWater.toFloat()]).mosaic().clip(region).updateMask(valid);
    left.layers().reset(); right.layers().reset();
    left.addLayer(water.selfMask(), {palette: ['2fb9ed']}, 'Observed water (experimental)', false, 0.7);
    left.addLayer(latest.select('time').divide(86400000), {min: Date.parse(raw)/86400000 - Number(days.getValue()), max: Date.parse(raw)/86400000, palette: ['af6345','f6e6ba','2d8477']}, 'Per-pixel observation day', false);
    dryLayer = right.addLayer(land, visRGB, 'Recently dried — historical Sentinel fill (10–20 m)', showDry.getValue());
    waterLayer = right.addLayer(modeledWater, visRGB, 'Detected water — synthetic appearance', true, waterOpacity.getValue());
    right.addLayer(water.selfMask(), {palette: ['2fb9ed']}, 'Detected water', false, 0.7);
    // Explicit unknown overlay keeps reference imagery from looking like observed dry land.
    right.addLayer(valid.unmask(0).not().selfMask().clip(region), {palette: ['747a81']}, 'Unknown / no valid classification', true, 0.7);
    outline(left); outline(right);
    status.setValue('Layers ready. Calculating approximate area and coverage at 100 m…');
    var area = ee.Image.pixelArea().divide(1e6);
    var totals = area.updateMask(water).rename('waterKm2').addBands(area.updateMask(valid).rename('validKm2')).addBands(area.rename('totalKm2'))
      .reduceRegion({reducer: ee.Reducer.sum(), geometry: region, scale: 100, maxPixels: 1e8, tileScale: 4});
    var stats = ee.Dictionary(totals).set('latestScene', ee.Date(source.aggregate_max('system:time_start')).format('YYYY-MM-dd'))
      .set('windowStart', start.format('YYYY-MM-dd')).set('windowEnd', raw);
    stats.evaluate(function(values, statError) {
      if (id !== generation) return;
      run.setDisabled(false);
      if (statError) {status.setValue('Layers ready; statistics failed: ' + statError); return;}
      var coverage = 100 * (values.validKm2 || 0) / values.totalKm2;
      status.setValue('Latest scene: ' + values.latestScene + '\nWindow: ' + values.windowStart + ' → ' + raw + '\nWater: ~' + Math.round(values.waterKm2 || 0).toLocaleString() + ' km²\nValid coverage: ' + coverage.toFixed(1) + '%\nPixel dates vary. Areas are approximate at 100 m.');
      var button = ui.Button('Prepare web app analysis JSON', function() {
        button.setDisabled(true);
        var result = {schemaVersion: 1, rendering: 'satellite-preserving-overlays-v2', region: 'Sindh', method: chosen, generatedAt: new Date().toISOString(), windowStart: values.windowStart, windowEnd: raw, latestScene: values.latestScene, waterKm2: values.waterKm2 || 0, coveragePercent: Math.min(100, coverage), statisticsScale: 100, thresholds: {mndwi: opticalThreshold, vv: radarThreshold}, layers: {}};
        function receive(name, image, visual) {
          image.getMapId(visual, function(info, mapError) {
            if (id !== generation) return;
            if (mapError || !info) {status.setValue('Could not prepare tiles: ' + mapError); button.setDisabled(false); return;}
            result.layers[name] = {url: info.urlFormat || ('https://earthengine.googleapis.com/v1/' + info.mapid + '/tiles/{z}/{x}/{y}')};
            if (result.layers.water && result.layers.reconstruction) {
              print('Save this object as sindh-analysis.json. Tile URLs are temporary. Reconstruction tiles contain surface overlays only; supply a satellite basemap.', result);
              exportPanel.add(ui.Textbox({value: JSON.stringify(result), style: {stretch: 'horizontal'}, placeholder: 'Copy JSON and save as sindh-analysis.json'}));
              exportPanel.add(ui.Label('Copy the JSON text, save as sindh-analysis.json, and load it in the web workspace. URLs are temporary and may require project access. No credentials are included.', {fontSize:'12px'}));
              button.setDisabled(false);
            }
          });
        }
        receive('water', water.selfMask(), {palette: ['2fb9ed']});
        receive('reconstruction', reconstruction, visRGB);
      });
      exportPanel.add(button);
      exportPanel.add(ui.Button('Prepare province preview images', function() {
        var bounds = ee.Geometry.Rectangle([66.6, 23.7, 71.2, 28.55], null, false);
        reconstruction.visualize(visRGB).getThumbURL({region: bounds, dimensions: 1536, format: 'png'}, function(url, error) {
          if (error) {status.setValue('Preview failed: ' + error); return;}
          exportPanel.add(ui.Label({value: 'Download surface overlays (no satellite basemap)', targetUrl: url}));
        });
        water.unmask(-1).clip(region).visualize({min: -1, max: 1, palette: ['808080','000000','ffffff']}).getThumbURL({region: bounds, dimensions: 1536, format: 'png'}, function(url, error) {
          if (error) {status.setValue('Water preview failed: ' + error); return;}
          exportPanel.add(ui.Label({value: 'Download measured water mask', targetUrl: url}));
        });
      }));
    });
  });
}
outline(left); outline(right);
// Run explicitly with the button to avoid starting a compute job on every load.



// Historical single-day analysis and GIS exports. No visual structure masks modify scientific data.
var historyPanel = ui.Panel({style:{width:'340px',padding:'18px',backgroundColor:'#f7faf7'}});
var historyBox = null, historyGeometry = null, historyScan = 0, historyDates = [], historyCollection, historyResult=0;
var historyStatus = ui.Label('Select a small area and scan one month for clear observations.', {whiteSpace:'pre-wrap'});
var requestedDay = String(ui.url.get('date', new Date().toISOString().slice(0,10)));
if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDay)) requestedDay = new Date().toISOString().slice(0,10);
// Share of 20 m pixels (inside Sindh) that must be clear. 100% is unreachable for large areas: SCL leaves scattered
// unclassified / medium-cloud pixels over sand and towns. The web map's calendar applies the same rule.
var minClear = Number(ui.url.get('minclear', 99)); if (!(minClear >= 50 && minClear <= 100)) minClear = 99;
var historyClearShare = {};
var historyMonth = ui.Textbox({value:requestedDay.slice(0,7),placeholder:'YYYY-MM',onChange:invalidateHistory});
var clearDay = ui.Select({items:[],placeholder:'Scan a month first',onChange:function(){historyResult++;historyOutputs.clear();historyAnalyze.setDisabled(false);}});
var historyOutputs = ui.Panel();
function showHistory(){ui.root.widgets().set(1,historyPanel);historyPanel.style().set('shown',true);}
function invalidateHistory(){historyScan++;historyResult++;historyDates=[];clearDay.items().reset([]);historyAnalyze.setDisabled(true);if(scanButton)scanButton.setDisabled(false);historyOutputs.clear();historyStatus.setValue('Area or month changed. Scan clear days again.');}
var historyAnalyze = ui.Button({label:'Analyze selected clear day',disabled:true,onClick:analyzeClearDay});
var scanButton = ui.Button('Find clear days in month',scanClearDays);
historyPanel.add(ui.Label('HISTORY & GIS EXPORT', {fontWeight:'bold',fontSize:'20px',color:'#164e43'}));
historyPanel.add(ui.Button('Back to province overview',function(){ui.root.widgets().set(1,panel);}));
historyPanel.add(ui.Label('2020 to today · Sentinel-2 MNDWI', {fontWeight:'bold'}));
historyPanel.add(ui.Label('Only acquisition days with at least '+minClear+'% of the 20 m pixels in your selected area clear and observed are listed; the rest are left out of the water total. SCL excludes clouds/shadows and Cloud Score+ cs_cdf ≥ 0.65 screens residual obscuration. Automated screening is not a guarantee.',{fontSize:'12px'}));
historyPanel.add(ui.Button('Use current map view as area',function(){setHistoryBox(left.getBounds());}));
var boxLabel=ui.Label('No area selected. Zoom in, then use the map view.',{fontSize:'12px'});historyPanel.add(boxLabel);
historyPanel.add(ui.Label('Month (YYYY-MM)'));historyPanel.add(historyMonth);historyPanel.add(scanButton);historyPanel.add(clearDay);historyPanel.add(historyAnalyze);historyPanel.add(historyStatus);historyPanel.add(historyOutputs);
historyPanel.add(ui.Label('Exports: 10 m EPSG:32642 (UTM 42N) GeoTIFF; water = 1, dry = 0, unknown/outside Sindh = -9999 (set this NoData value in GIS). Band 2 is MNDWI, band 3 is acquisition day since 1970-01-01 UTC. GeoJSON polygons are WGS84. Raw classification, no AI material or infrastructure display exclusions.',{fontSize:'11px'}));
panel.widgets().insert(2,ui.Button('Historical clear dates & GIS exports',showHistory));
function setHistoryBox(b){
  if(typeof b==='string'){try{b=JSON.parse(b);}catch(e){historyStatus.setValue('Invalid area coordinates.');return;}}
  if(!Array.isArray(b)||b.length!==4||b.some(function(v){return typeof v!=='number'||!isFinite(v);})||b[0]>=b[2]||b[1]>=b[3]||b[0]<66.5||b[2]>71.3||b[1]<23.6||b[3]>28.7){historyStatus.setValue('Select a rectangle within the Sindh map bounds.');return;}
  var km2=6371*6371*Math.abs((b[2]-b[0])*Math.PI/180*(Math.sin(b[3]*Math.PI/180)-Math.sin(b[1]*Math.PI/180)));
  if(km2<0.001||km2>400){historyStatus.setValue('Area must be between 0.001 and 400 km². Zoom in before selecting.');return;}
  invalidateHistory();historyBox=b;historyGeometry=ee.Geometry.Rectangle(b,null,false).intersection(region,ee.ErrorMargin(1));
  boxLabel.setValue('Selected rectangle: '+km2.toFixed(2)+' km²; clipped to Sindh.');left.setCenter((b[0]+b[2])/2,(b[1]+b[3])/2,14);right.setCenter((b[0]+b[2])/2,(b[1]+b[3])/2,14);
}
function strictS2(img){
  var scl=img.select('SCL');
  // Require all 10 m Cloud Score+ subpixels to pass before reducing to 20 m.
  // Cloud Score+ lags new scenes by a few days; the linked band then has no projection, which broke reduceResolution
  // for the whole month. Give it the scene's 10 m grid so a missing score just fails those pixels.
  var score=img.select('cs_cdf').setDefaultProjection(img.select('B3').projection()).gte(0.65).unmask(0).reduceResolution({reducer:ee.Reducer.min(),maxPixels:16}).reproject({crs:'EPSG:32642',scale:20});
  var clear=scl.eq(4).or(scl.eq(5)).or(scl.eq(6)).and(score);
  var sum=img.select('B3').add(img.select('B11'));
  var index=img.select('B3').subtract(img.select('B11')).divide(sum).rename('mndwi').updateMask(sum.gt(0));
  return img.select(RGB.concat(['B8','B11'])).addBands(index).addBands(img.normalizedDifference(['B3','B8']).rename('ndwi')).updateMask(clear).copyProperties(img,['system:time_start']);
}
function scanClearDays(){
  if(!historyGeometry){historyStatus.setValue('Select an area first.');return;}
  var month=historyMonth.getValue(),today=new Date().toISOString().slice(0,10);
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)||month<'2020-01'||month>today.slice(0,7)){historyStatus.setValue('Choose a month from 2020-01 through '+today.slice(0,7)+'.');return;}
  invalidateHistory();var scanId=historyScan;scanButton.setDisabled(true);historyStatus.setValue('Checking acquisition days and every 20 m cell…');
  var start=ee.Date(month+'-01'),end=ee.Date(ee.Number(start.advance(1,'month').millis()).min(ee.Date(today).advance(1,'day').millis()));
  historyCollection=ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED').filterBounds(historyGeometry).filterDate(start,end)
    .linkCollection(ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED'),['cs_cdf']).map(strictS2);
  var dates=ee.List(historyCollection.aggregate_array('system:time_start')).map(function(t){return ee.Date(t).format('YYYY-MM-dd');}).distinct().sort();
  var screened=ee.FeatureCollection(dates.map(function(d){d=ee.String(d);var day=historyCollection.filterDate(ee.Date(d),ee.Date(d).advance(1,'day')).mosaic();
    var valid=day.select('mndwi').mask().unmask(0,false).rename('clear');
    var minimum=valid.reduceRegion({reducer:ee.Reducer.mean(),geometry:historyGeometry,crs:'EPSG:32642',scale:20,maxPixels:2e6,tileScale:4}).get('clear');
    return ee.Feature(null,{date:d,clear:minimum});
  })).filter(ee.Filter.gte('clear',minClear/100));
  ee.Dictionary.fromLists(screened.aggregate_array('date'),screened.aggregate_array('clear')).evaluate(function(dict,error){var list=dict?Object.keys(dict).sort():null;historyClearShare=dict||{};
    if(scanId!==historyScan)return;scanButton.setDisabled(false);
    if(error){historyStatus.setValue('Cloud screening failed: '+error);return;}
    historyDates=list||[];clearDay.items().reset(historyDates);
    if(!historyDates.length){historyStatus.setValue('No days at least '+minClear+'% clear and observed in this month for this area. Try another month or a smaller area.');return;}
    clearDay.setValue(historyDates.indexOf(requestedDay)>=0?requestedDay:historyDates[historyDates.length-1]);
    historyStatus.setValue(historyDates.length+' clear acquisition days found. '+(historyDates.indexOf(requestedDay)<0?'Requested '+requestedDay+' is not clear/observed; choose an available day below.':'Requested day is available. Click Analyze.'));historyAnalyze.setDisabled(false);
  });
}
function analyzeClearDay(){
  var day=clearDay.getValue();if(historyDates.indexOf(day)<0)return;
  var resultId=++historyResult,scanId=historyScan,geom=historyGeometry,box=historyBox.slice(),threshold=mndwi.getValue();
  historyOutputs.clear();historyAnalyze.setDisabled(true);historyStatus.setValue('Preparing '+day+' observations and water mask…');
  var image=historyCollection.filterDate(day,ee.Date(day).advance(1,'day')).mosaic().clip(geom),index=image.select('mndwi');
  var water=waterRule(image,threshold).rename('water');
  var material=ee.Image(WATER_TEXTURE_ASSET).select([0,1,2],RGB).resample('bilinear').divide(255).pow(1.3).multiply(3000).updateMask(water).clip(geom);
  left.layers().reset();right.layers().reset();left.addLayer(image,visRGB,day+' clear Sentinel-2',true);right.addLayer(material,visRGB,day+' synthetic water',true,.85);right.addLayer(water.selfMask(),{palette:['2fb9ed']},day+' detected water',false);outline(left);outline(right);
  var stats=ee.Image.pixelArea().divide(1e6).updateMask(water).reduceRegion({reducer:ee.Reducer.sum(),geometry:geom,crs:'EPSG:32642',scale:10,maxPixels:5e7,tileScale:4});
  stats.evaluate(function(result,error){
    if(scanId!==historyScan||resultId!==historyResult)return;historyAnalyze.setDisabled(false);
    if(error){historyStatus.setValue('Statistics failed: '+error);return;}
    historyStatus.setValue(day+' · clear screened area · '+Number(result.area||0).toFixed(3)+' km² detected water.');
    var name='sindh_water_'+day.replace(/-/g,'');
    var raster=water.toFloat().addBands(index.toFloat()).addBands(ee.Image.constant(ee.Date(day).millis().divide(86400000)).rename('observation_day').toFloat().updateMask(index.mask())).clip(geom).unmask(-9999,false);
    var vectors=water.selfMask().toInt().reduceToVectors({geometry:geom,crs:'EPSG:32642',scale:10,geometryType:'polygon',eightConnected:true,labelProperty:'water',maxPixels:5e7,tileScale:4}).map(function(f){return f.set({date:day,method:'S2 MNDWI',threshold:threshold,cloud_cdf:0.65,scale_m:10});});
    var manifest={schemaVersion:1,rendering:'satellite-preserving-overlays-v2',region:'Sindh',method:'Sentinel-2 MNDWI',observationMode:'single-clear-day',area:box,clearDates:historyDates,cloudScreen:{scl:[4,5,6],cs_cdf:0.65,requiredCoverage:minClear,scale:20},generatedAt:new Date().toISOString(),windowStart:day,windowEnd:day,latestScene:day,waterKm2:result.area||0,coveragePercent:Math.round((historyClearShare[day]||1)*1000)/10,statisticsScale:10,thresholds:{mndwi:threshold,vv:-17},layers:{},exports:{}};
    var returnLink=ui.Label({value:'Preparing map result…',style:{fontSize:'16px',fontWeight:'bold',color:'#176148'}});
    historyOutputs.add(returnLink);
    var exportStatus=ui.Label('Preparing GeoTIFF and water polygons…',{fontSize:'12px'});historyOutputs.add(exportStatus);
    var finished=0,failures=[];
    function current(){return scanId===historyScan&&resultId===historyResult;}
    function updateReturn(){if(!current())return;if(manifest.layers.water&&manifest.layers.reconstruction){returnLink.setValue('Show result on Sindh map ↗');returnLink.setUrl('https://rawal-karim.github.io/sindh-water-observatory/#analysis='+encodeURIComponent(JSON.stringify(manifest)));}if(finished===2)exportStatus.setValue(failures.length?failures.join(' '):'Both water-data downloads are ready. The map link includes them.');}
    function receive(key,img,visual){img.getMapId(visual,function(info,err){if(!current())return;if(err||!info){historyStatus.setValue('Map tiles failed: '+err+'. Click Analyze to retry.');return;}manifest.layers[key]={url:info.urlFormat||('https://earthengine.googleapis.com/v1/'+info.mapid+'/tiles/{z}/{x}/{y}')};updateReturn();});}
    receive('water',water.selfMask(),{palette:['2fb9ed']});receive('reconstruction',material,visRGB);
    raster.getDownloadURL({name:name,region:ee.Geometry.Rectangle(box,null,false),crs:'EPSG:32642',scale:10,format:'GEO_TIFF',filePerBand:false},function(url,err){if(!current())return;finished++;if(err||!url){failures.push('GeoTIFF failed; choose a smaller area or Analyze again.');}else{manifest.exports.geotiff=url;historyOutputs.add(ui.Label({value:'Download water GeoTIFF ↗',targetUrl:url}));}updateReturn();});
    vectors.getDownloadURL({format:'geojson',filename:name,callback:function(url,err){if(!current())return;finished++;if(err||!url){failures.push('Water polygons failed; choose a smaller area or Analyze again.');}else{manifest.exports.geojson=url;historyOutputs.add(ui.Label({value:'Download water polygons (GeoJSON) ↗',targetUrl:url}));}updateReturn();}});
    historyOutputs.add(ui.Label('GeoTIFF: water, MNDWI, observation_day. Set NoData to -9999. Download links expire; save files after generation. No copying JSON is needed.',{fontSize:'11px'}));
    historyOutputs.add(ui.Button('Show analysis JSON (optional)',function(){historyOutputs.add(ui.Textbox({value:JSON.stringify(manifest),style:{stretch:'horizontal'}}));}));
  });
}
var suppliedBox=ui.url.get('box',null);if(suppliedBox)setHistoryBox(suppliedBox);
if(ui.url.get('history',false)){showHistory();if(historyBox&&ui.url.get('auto',false))scanClearDays();}

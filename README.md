# Veronaut Products API


<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<br />

<div align="center">
  <h3 align="center">Veronaut Products API</h3>

  <p align="center">
    Veronaut is not going to tell you which product to purchase or which brand to boycott.  What makes a garment’s supply chain “sustainable” is not only a complex issue, it also depends on who you ask.  We want to help you make informed decisions by making it as easy as possible to find the facts.
    <br />
    <br />
    <a href="https://veronaut.herokuapp.com">View Demo</a>
    ·
    <a href="https://github.com/georgiakirkpatrick/veronaut-products-api/issues">Report a Bug</a>
    ·
    <a href="https://github.com/georgiakirkpatrick/veronaut-products-api/issues">Request a Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#sustainable-fashion-a-brief-history">"Sustainable Fashion": a Brief History</a></li>
        <li><a href="#why-veronaut-is-needed">Why Veronaut is Needed</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT
  This is an important component of your project that many new developers often overlook.

  Your description is an extremely important aspect of your project. A well-crafted description allows you to show off your work to other developers as well as potential employers.

  The quality of a README description often differentiates a good project from a bad project. A good one takes advantage of the opportunity to explain and showcase:

  - What your application does,
  - Why you used the technologies you used,
  - Some of the challenges you faced and features you hope to implement in the future.
-->

## About The Project
Veronaut was created in 2020 as the capstone project for my Bloc (now Thinkful) Full-Stack Engineering bootcamp.  The requirements for my capstone project were to create a responsive, full-stack app using React.js, CSS, Node.js, Express, and PostgreSQL.  This was a solo project which I completed with occasional help from a mentor.

The early vision of this app resulted from my professional background. Before I joined a software engineering bootcamp, I earned a biology degree with a focus on environmental conservation and additional studies in economics, conducted research of [smallholder](#smallholder) cotton farms in Peru, and founded a mission-based clothing brand, [Silvania](https://silvaniaperu.com).  My background in the fashion industry, as well as my personal experience shopping for clothes, has led me to see that finding sustainably-made clothing as a consumer is unnecessarily cumbersome.  I go into further details about these challenges below in <a href="#why-veronaut-is-needed">Why Veronaut is Needed</a>.  

### "Sustainable Fashion": a Brief History
"Sustainable fashion" is an amorphous term, but it generally describes clothing and fashion accessories made with the best possible impact on the natural environment and human communities touched by the fashion supply chain.  Sustainable fashion makes up a small minority of the global fashion industry's output.  In fact, Good On You, an organization that rates brands for sustainability, says the segment of brands that have received a "good" rating or better make up less than 1% of all the large brands they have rated [^2].

The opposite of sustainable fashion, which makes up the large majority of the industry, is often called "fast fashion".  The term arose during the late 20th century [^3], inspired by brands like Zara and H&M that made cheap, low-quality clothing produced by hyper-efficient supply chains that expoloited workers and disregarded enironmental impact.  A large share of the idustry has followed suit in order to compete.

While the "fast fashion" model that now dominates the fashion industry is a recent phenomenon, the groundwork for today's expoitative production was laid during the Industrial Revolution.

* #### Prehistory to the 18th century - OG Sustainable Fashion
  Before the 18th century, the manufacture of thread, fabric, and clothing was arduous and expensive.  The fastest modes of transport of people and goods before the Industrial Revolution were powered by animals, water currents, and wind [^4].  Therefore, clothing was made mostly from local fibers and animal skins, although international trade of fiber and fabric did exist in several regions.  Most people owned just a few items of clothing which were woven, knit, sewn, dyed, and laundered by hand.

* #### The 18th Century - Dawn of the Industrial Revolution
  The fashion industry of the 18th and 19th centuries saw an abundance of technological advances that would take it from cottage industry to factory manufacturing.  Steam ships and trains were developed, allowing for fibers and fabrics to be traded widely.  The flying shuttle was patented in 1733 [^4], increasing the speed of weaving.  Faster weaving led to a demand for faster thread spinning, leading to the invention of the water frame (patented in 1969), spinning jenny (patented in 1770), and spinning mule (invented around 1775) [^4].  These advances sparked the constructon of cotton mills that used water power and, later, steam engines to drive manufacturing.

  Cotton mills widely employed young women and children to reduce labor costs [^5].  Working conditions in these cotton mills were poor, with hot, humid air and airborn cotton dust that led to lung disease and eye infections [^5].  The high noise levels of mechanized looms led to hearing loss, and carcinogenic lubricants used on factory machinery led to cancers that came to be known as "spinner's cancer" [^5].  Injuries and deaths from factory machinery were common with children making up many of the casualties [^5].
  
  In the agricultural sector, the industrial period increased the demand for slave labor in the American South to replace the population who left rural agricultural work for factory jobs in cities [^6].  Cotton became the the leading cash crop and principal commodity harvested by American enslaved people by the early 19th century. [^7]

* #### The 19th century - Sweatshops and Ready-to-Wear Clothing
  While the 18th century saw the creation of the first fabric mills, the manufacture of clothing itself was still done either at home or by tailors or seamstresses.   The 19th century saw the industrialization of clothing production.  Early sewing machines were develeped in the 1830's [^8] and largely replaced hand-sewing as machines became widely available in the 1850's[^9].
  
  The First recorded ready-made-clothing factory in the US was established in 1831 in New York [^10].  The term "sweatshop" was coined soon after to describe clothing production businesses in which middlemen (the "sweaters") subcontracted sewing work [^10].  Sweatshops were characterized by harsh working conditions with poor ventilation, insufficient bathroom facilities, no running water, bad lighting, and little insulation, making them too hot in summer and too cold in winter [^10].  Above all, sweatshops were known for demanding long work hours and providing meager pay.  The clothing production sector drew workers with few other opportunities for employment, such as women and immigrant communities.  Among the 19th century immigrant groups that dominated sweatshop jobs in the United States were those from Germany, Ireland, and Jewish immigrants from Eastern Europe [^10]. By the 1880's, garment factories had become commmon in many American and European cities[^10].  

* #### Late 19th through mid 20th Centuries - Synthetic Fibers
  The late 19th and early 20th centuries saw the invention and commercialization of synthetic fibers, such as rayon, nylon, acrylic, polyester, spandex [^11].  Four of these fibers share a lot in common - nylon, acrylic, polyester, and spandex were all developed by DuPont and made of plastic.  The commercialization of these synthetic fibers led to new environmental threats: the creation of waste from discarded garments that do not biodegrade and microplastic pollution.

  Sweatshop workers began to unionize in the late 19th century, demanding better working conditions and pay.  After World War II, many garment workers in the northeastern United States benefitted from unionization, but the increased cost of sourcing garment production with unionized garment workers caused manufacturers to look for cheaper factories in the South (primarily North Carolina) and in the western United States (primparily California), where garment factories were not unionized [^10].  Manfacturers also looked for cheap labor overseas and in the 1960's saw the first large wave of imported garments from Asia [Arnesen, Eric].  By the late 1990's, more than 60% of garments sold in the US were imported, mostly from Asian countries [^10].

* #### Mid-20th Century - Pioneers of Modern "Sustainable Fashion"
  In the 1960`s and 1970's, outdoor apparel companies such as Patagonia and The North Face were founded, making clothing and gear for rock climbers and other outdoor enthusiasts [^12] [^13].  The brands, along with 12 others, founded the Outdoor Industry Association in the 1980's, bringing together some of the most environmental-conservation-committed brands in the fashion industry [^14].  Patagonia later became a founding member of the Fair Labor Association in 1999 [^16] and co-founded the Sustainable Apparel Coalition in 2009 [^15].

  While sustainability and ethics issues in the fashion industry were becomeing better understood  in the late 20th century, only a small percentage of brands put resources toward understanding the environmental and socioeconomic impacts of their supply chains.

* #### 2010's - "Sustainable Fashion" Goes Mainstream
  The environmental impacts and ethical concerns within the global fashion industry gained widespread attention from consumers and media throughout the 2010's thanks, in part, to the 2013 collapse of the [Rana Plaza](#rana-plaza) garment factories in Bangladesh, killing over a thousand people and injuring over two thousand [^18].

  Consumers began to demand transparency from clothing brands and initiatives such as Fashion Revolution in 2013 [^19], Good On You 2015 [^20], and UN Alliance for Sustainable Fashion in 2018 [^21] brought the general public into conversations about the apparel supply chains.

### The Current State of the Fashion Industry
  * #### Economy 
    - Context: The fashion industry is one of the largest industries in the world at approximately $2 trillion in annual global revenue (Fashion United) employing more than 300 million people along the value chain. [Euromonitor in MacArthur]

    - Problem: (How is the industry status quo problematic?)

    - Solution: (How does the industry need to change to solve the problem?)
    A new textiles economy reflects the true cost (environmental and societal) of materials and production processes in the price of products.  In a new textiles economy, the price of clothing reflects the full costs of its production, including environmental and societal externalities (see Section 4.2). Such costs are first analysed and presented in company reporting, and ultimately reflected in product prices. [MacArthur]

  * #### Polution
    - Context:
      - Textiles account for approximately 9% of annual microplastic losses to the oceans [^1]
      - During textile use, trillions of plastic microfibres are released through washing; most of these ultimately end up in the ocean. Plastics entering the ocean is a growing concern due to the associated negative environmental and health implications. In recent years, plastic microfibres from the washing of plastic-based textiles, such as polyester, nylon, and acrylic, have been identified as a major contributor to this issue.[92] Each year, around half a million tonnes of plastic microfibres – equivalent to more than 50 billion plastic bottles – resulting from the washing of textiles are estimated to be released into the ocean.[93] [in MacArthur]
    - Problem: (How is the industry status quo problematic?)
    - Solution: (How does the industry need to change to solve the problem?)
      - A new textiles economy regenerates natural systems and does not pollute the environment.  In a new textiles economy, where renewable resources are extracted from nature this is carried out by regenerative and restorative methods that allow for the maintenance or improvement of soil quality and rebuild natural capital. In particular, this means using regenerative agriculture for biological-based input such as cotton, and sustainably managed forests and plantations for wood-based fibres. Substances of concern do not leak into the environment or risk the health of textile workers and clothing users. Plastic microfibres are not released into the environment and ocean. Other pollutants, such as greenhouse gases, are also designed out. [MacArthur]
  
  * #### Use of natural resources
    - Context:
    - Problem:
    - Solution:
    - Around 215 trillion liters of water per year are consumed by the industry [^1]
    - The industry relies on 98 million tonnes in total of non-renewable resources per year. Producing plastic-based fibres for textiles uses an estimated 342 million barrels of oil every year,[71] and the production of cotton is estimated to require 200,000 tonnes of pesticides and 8 million tonnes of fertilisers annually.[72] Chemicals used in the production processes for fibres and textiles, such as dyes or finishing treatments, also account for a significant amount of resource use – around 43 million tonnes in total.[73] [in MacArthur]
    - Hazardous chemical use has negative impacts across all parts of the value chain. Significant volumes of chemicals are used to produce clothing and other textiles. There is little data or transparency about which chemicals used cause concern or their full impact on human health and the environment during the production, use, and after-use phases. Cotton production uses 2.5% of the world’s arable land, but accounts for 16% of all pesticides used;[74] in India 50% of all pesticides are used for cotton production,[75] with negative impacts on farmers’ health.[76] The Citarum River in Indonesia has over 200 textile factories along its banks; these factories release dyes and other chemicals into the water, changing the colour of the river and devastating the local ecosystem.[77] Chemicals used in production may be retained in the finished textiles, causing concern about their impact on the wearer, and released into ecosystems during washing or when discarded after use. Often, this impact is not well assessed. For example, to achieve crease-resistant ‘non-iron’ garments, clothing is often treated with formaldehyde[78] which has been classified as carcinogenic to humans by the International Agency for Research on Cancer, and is also linked to allergic contact dermatitis.[79] Other potential impacts to human health include the accumulation of toxic substances in the human body through exposure to polluted water or food sources.[80] [in MacArthur]
    - Textiles production (including cotton farming) uses around 93 billion cubic metres of water annually, representing 4% of global freshwater withdrawal.85 Clothing accounts for over two- thirds of this water use. [in MacArthur]
    - Beyond production, washing clothing using washing machines is estimated to require an additional 20 billion cubic metres of water per year globally.88 [in MacArthur]

  * #### Carbon emissions
    - Context:
    - Problem:
    - Solution:
    - Is responsible for an estimated 2-8% of the world's greenhouse gas emissions  [^1]
    - According to some estimates, apparel and footwear generate up to 8% of the total greenhouse gas emissions (equivalency) (Quantis 2018), which are estimated to increase by more than 60% by 2030 (Ellen MacArthur Foundation 2017).
    - In 2015, greenhouse gas (GHG) emissions from textiles production totalled 1.2 billion tonnes of CO equivalent,81 more than those of all international flights and maritime shipping combined.82 This is mainly due to the high amounts of throughput in the current linear system, but it is also exacerbated by the high GHG intensity of textiles, with the production of 1 tonne of textiles generating 17 tonnes of CO2 equivalent (compared to 3.5 tonnes for plastic and less than 1 tonne for paper).83 GHG emissions during the use phase of textiles are also significant. Washing and drying clothing alone are estimated to account for 120 million tonnes of CO2 equivalent.84 [in MacArthur]

    A new textiles economy runs on renewable energy and uses renewable resources where resource input is needed. The energy required to fuel a new textiles economy is renewable by nature, decreasing resource dependence and increasing system resilience. Resources are kept in the system and where input is needed, this comes from renewable resources. This means using renewable feedstock for plastic-based fibres and not using fossil-fuel-based fertilisers or pesticides in the farming of biologically-based input. A new textiles economy further enables this shift to renewables as its very nature ensures that less energy and fewer resources are consumed. [MacArthur]

  * #### Worker Wellbeing
    - The fashion industry’s social and environmental problems also play out along geographic dimensions. While the main markets are located in Europe and the United States, the early stages of garment production, including raw material extraction and manufacturing, are heavily weighted towards Asia and towards developing countries and economies in transition (UNEP 2020).
    - The industry also has multiple negative societal implications, driven partly by the increasing pressure on manufacturers to deliver on shorter lead times and lower pricing. High cost and time pressures are often imposed on all parts of the supply chain,94 which can lead to garment workers suffering poor working conditions with long hours and low pay,95 with evidence, in some instances, of modern slavery and child labour.96 Efforts to improve these conditions are facing various challenges; for example, the right to establish trade unions is restricted.97 Many workers face dangerous working environments due to hazardous processes, substances of concern used during production, unsafe buildings, or lack of safety equipment. [in MacArthur]

    A new textiles economy is distributive by design.  As part of promoting overall system health, a new textiles economy presents new opportunities for distributed and inclusive growth. It creates a thriving ecosystem of enterprises from small to large, retaining and then circulating enough of the value created so that businesses and their employees can participate fully in the wider economy. [MacArthur]

  * #### Linearity
    The current system for producing, distributing, and using clothing operates in an almost completely linear way. Large amounts of non- renewable resources are extracted to produce clothes that are often used for only a short period, [] after which the materials are largely lost to landfill or incineration. It is estimated that more than half of fast fashion produced is disposed of in under a year.[McKinsey & Company, Style that’s sustainable: A new fast- fashion formula (2016)] This linear system leaves economic opportunities untapped, puts pressure on resources, pollutes and degrades the natural environment and its ecosystems, and creates significant negative societal impacts at local, regional, and global scales (see Figure 2) [^?].

    Less than 1% of material used to produce clothing is recycled into new clothing, representing a loss of more than USD 100 billion worth of materials each year. [Estimate based on Circular Fibres Initiative analysis on the share of materials and on a price of USD 2.8/kg for cotton yarn and USD 1.7/kg for polyester yarn (see http://www.globaltexassociates.com/price.html)[^?].]
  
    A new textiles economy captures the full value of clothing during and after use.In a new textiles economy clothes are used more often, allowing their value to be captured fully. Once clothes are not used anymore, recycling them into new clothes allows the value of the materials to be captured at different levels (see Figure 17, p.95). For this to be successful, no substances of concern that could contaminate products and prevent them from being safely recycled are used.
    [MacArthur]

  * #### Transparency and Accountability
    - For example, one global fast fashion retailer sourcing map includes approximately 750 suppliers that manufacture products for its eight global brands in around 1400 factories across 41 countries, which are sold in around 5,000 stores in 75 markets and across 52 markets via its online shop. The lack of traceability across such a globally dispersed value chain, in addition to varying legal, ethical, and commercial standards poses serious sustainability challenges, and inhibits the ability of buyers and retailers to detect non-compliant suppliers (UNEP 2020).

  * #### Growth
    The trajectory of the industry points to the potential for catastrophic outcomes Demand for clothing continues to grow quickly, driven particularly by emerging markets in Asia and South America. Should growth continue as expected, total clothing sales could reach 175 million tonnes in 2050 – more than three times today’s amount.99 This would further amplify the negative societal and environmental impacts of the current system and risk the industry’s reputation and profitability. [in MacArthur]
    -Negative impacts could become unmanageable If the industry continues on its current path, by 2050, textiles production would use more than 25% of the carbon budget for a 2°C pathway.100 Moving away from today’s linear and wasteful textiles system is therefore crucial to keeping the current target of a 2°C average global warming limit within reach. The number of plastic microfibres entering the ocean between 2015 and 2050 could accumulate to an excess of 22 million tonnes. The release of plastic microfibres into the ocean due to the washing of textiles could grow to 0.7 million tonnes per year by 2050. This would be the material equivalent of around 4 billion polyester tops.101 The accumulated amount entering the ocean between 2015 and 2050 would exceed 22 million tonnes – about two thirds of the plastic-based fibres used to produce garments annually. Material and water usage is set to become increasingly problematic. Input of fossil feedstocks for textiles production would reach 160 million tonnes by 2050. With water usage, the greatest challenge will be accessing the water that the textiles industry relies on in water-scarce regions. This has been identified by investors as a high risk for business disruption and potential for stranded assets.102 Management of textile waste would become increasingly challenging. In the business-as- usual scenario, more than 150 million tonnes of clothing would be landfilled or burned in 2050. 39 Between 2015 and 2050 the weight of these clothes would accumulate to more than ten times that of today’s world population.103

<p align="right">(<a href="#readme-top">back to top</a>)</p>

#### Terms
* <a name="smallholder"></a>A **smallholder** is a small farm that usually supports a single family with a mixture of cash crops and subsistence farming. [smallholder]
* <a name="rana-plaza"></a>The **Rana Plaza collapse** is considered to be the deadliest accidental structural failure in modern human history, killing 1,134 people and injuring around 2,500 people.  Many of the victims were garment workers.  The garment factories at Rana Plaza had produced clothing for global brands such as  Benetton, Zara, the Children's Place, El Corte Inglés, Joe Fresh, Mango, Matalan,Primark, and Walmart. [^18]
* <a name="sustainable-fashion"></a> "Sustainability encompasses social issues, such as improvements in working conditions and remuneration for workers, as well as environmental ones, including the reduction of the industry’s waste stream, and decreases in water pollution and contributions to greenhouse gas emissions." [^10]
* <a name="greenwashing"></a> **Greenwashing** is a form of marketing products deceptively used to persuade consumers that an organization's products, operations, or policies are environmentally friendly [^greenwashing].

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Why Veronaut is Needed
  Available Tools - pros and cons
  How sustainable fashion shoppers find information and purchase products
  Certifications - Fair Trade, Organic, B Corp, etc.
  Fashion Revolution's approach - pros/cons
  Good On You - pros/cons
  Outdoor Apparel Group - pros/cons
  Other guides, initiatives, tools - pros/cons

  How is it cumbersome?  Most consumers consider the following factors when buying clothes:
Cost
Comfort/Fit
Style

Consumers bear the burden of informing themselves about sustainability issues in the fashion industry.  Without any north star provided by the government, trade organizations, consumer protection groups, or the brands themselves, consumers must seek out reliable sources of information and learn to avoid [greenwashing](#greenwashing).

For consumers who decide to only buy clothing that meets their environmental and ethical standards, the convergence of cost, comfort, and style must also intersect with the consumer's ethical and environmental standards.  This reduces the quantity of options so drastically that finding the desired item of clothing that checks all the boxes can feel like the search for a needle in a haystack.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![React][React.js]][React-url]
* [![Node][Node.js]][Node-url]
* [![Express][Express-shield]][Express-url]
* [![PostgreSQL][PostgreSQL-shield]][PostgreSQL-url]
* [![Mocha][Mocha-shield]][Mocha-url]
* [![Chai][Chai-shield]][Chai-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED 
If you are working on a project that a user needs to install or run locally in a machine like a "POS", you should include the steps required to install your project and also the required dependencies if any.

Provide a step-by-step description of how to get the development environment set and running.
-->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.

To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/georgiakirkpatrick/veronaut-products-api.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES 
Provide instructions and examples so users/contributors can use the project. This will make it easy for them in case they encounter a problem – they will always have a place to reference what is expected.

You can also make use of visual aids by including materials like screenshots to show examples of the running project and also the structure and design principles used in your project.

Also if your project will require authentication like passwords or usernames, this is a good section to include the credentials.
-->

## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3
    - [ ] Nested Feature

[![Product Name Screen Shot][product-screenshot]](https://example.com)

What Veronaut does
Why I used the technologies I used
Some of the challenges you faced and features you hope to implement in the future.

See the [open issues](https://github.com/georgiakirkpatrick/veronaut-products-api/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE 
For most README files, this is usually considered the last part. It lets other developers know what they can and cannot do with your project.

We have different types of licenses depending on the kind of project you are working on. Depending on the one you will choose it will determine the contributions your project gets.

The most common one is the GPL License which allows other to make modification to your code and use it for commercial purposes. If you need help choosing a license, use check out this link: https://choosealicense.com/
-->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Georgia Kirkpatrick - [Georgia's Website](https://georgiakirkpatrick.com) - [Contact Form](https://georgiakirkpatrick.com/#contact)

Project Link: [https://github.com/georgiakirkpatrick/veronaut-products-api](https://github.com/georgiakirkpatrick/veronaut-products-api)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- ACKNOWLEDGMENTS 
If you worked on the project as a team or an organization, list your collaborators/team members. You should also include links to their GitHub profiles and social media too.

Also, if you followed tutorials or referenced a certain material that might help the user to build that particular project, include links to those here as well.

This is just a way to show your appreciation and also to help others get a first hand copy of the project.
-->
## Acknowledgments

<p align="right">(<a href="#readme-top">back to top</a>)</p>



  <p align="right">(<a href="#readme-top">back to top</a>)</p>

### Bibliography
  [^1]: “Home - The UN Alliance for Sustainable Fashion,” The UN Alliance for Sustainable Fashion, accessed September 25, 2023. [https://unfashionalliance.org/](https://unfashionalliance.org/).

  [^2]: "Guide to the Good On You Brand Rating System", Good On You, accessed on December 4, 2023, [https://goodonyou.eco/wp-content/uploads/2023/10/GoodOnYou-RatingsMethodology-Oct23.pdf](https://goodonyou.eco/wp-content/uploads/2023/10/GoodOnYou-RatingsMethodology-Oct23.pdf).

  [^3]: Anne-Marie Schiro, "Fashion; Two New Stores That Cruise Fashion's Fast Lane", *New York Times*, December 31, 1989, [https://www.nytimes.com/1989/12/31/style/fashion-two-new-stores-that-cruise-fashion-s-fast-lane.html](https://www.nytimes.com/1989/12/31/style/fashion-two-new-stores-that-cruise-fashion-s-fast-lane.html)

  [^4]: Wikipedia, The Free Encyclopedia, "Textile manufacture during the British Industrial Revolution," November 4, 2023. [https://en.wikipedia.org/wiki/Textile_manufacture_during_the_British_Industrial_Revolution#Elements_of_the_Industrial_Revolution](https://en.wikipedia.org/wiki/Textile_manufacture_during_the_British_Industrial_Revolution#Elements_of_the_Industrial_Revolution)

  [^5]: Wikipedia, The Free Encyclopedia, "Cotton Mill,"  October 20, 2023, [https://en.wikipedia.org/wiki/Cotton_mill](https://en.wikipedia.org/wiki/Cotton_mill)

  [^6]: John Green, “The Industrial Revolution: Crash Course European History #24,” Crash Course, Nov 5, 2019, video, 17:06. [https://thecrashcourse.com/courses/the-industrial-revolution-crash-course-european-history-24/](https://thecrashcourse.com/courses/the-industrial-revolution-crash-course-european-history-24/)

  [^7]: Wikipedia, The Free Encyclopedia, "Antebellum South", November 14, 2023, [https://en.wikipedia.org/wiki/Antebellum_South](https://en.wikipedia.org/wiki/Antebellum_South)

  [^8]: Britannica, T. Editors of Encyclopaedia. "sewing machine." Encyclopedia Britannica, October 27, 2023. [https://www.britannica.com/technology/sewing-machine](https://www.britannica.com/technology/sewing-machine).

  [^9]: Britannica, T. Editors of Encyclopaedia. "Isaac Singer." Encyclopedia Britannica, October 23, 2023. [https://www.britannica.com/biography/Isaac-Singer](https://www.britannica.com/biography/Isaac-Singer).

  [^10]: Eric Arnesen, "Garment Industry," Encyclopedia of U.S. Labor and Working-Class History (New York: Taylor & Francis Group, 2007), 495-496 [https://books.google.com/books?id=zEWsZ81Bd3YC](https://books.google.com/books?id=zEWsZ81Bd3YC).

  [^11]: Wikipedia, The Free Encyclopedia, "Synthetic fiber", October 21, 2023, [https://en.wikipedia.org/wiki/Synthetic_fiber](https://en.wikipedia.org/wiki/Synthetic_fiber)

  [^12]"Company History", Patagonia, accessed December 7, 2023, [https://www.patagonia.com/company-history/](https://www.patagonia.com/company-history/).

  [^13] "Our Journey," North Face, accessed December 7, 2023, [https://www.thenorthface.com/en-us/about-us/history](https://www.thenorthface.com/en-us/about-us/history).

  [^14]: “Who We Are - Outdoor Industry Association,” Outdoor Industry Association, accessed November 2, 2023, [https://outdoorindustry.org/who-we-are-2023](https://outdoorindustry.org/who-we-are-2023).

  [^15]: Nick Paumgarten, "Patagonia’s Philosopher-King," *The New Yorker*, September 12, 2016, https://www.newyorker.com/magazine/2016/09/19/patagonias-philosopher-king.

  [^16]: "Fair Labor Association - Patagonia," Patagonia, accessed December 7, 2023 [https://www.patagonia.com/our-footprint/fair-labor-association.html](https://www.patagonia.com/our-footprint/fair-labor-association.html)

  [^17]: "SAC,　Leading the Evolution for Impact in the Global Textile, Apparel & Footwear Industry," Sustainable Apparel Coalition, accessed December 7, 2023 [https://apparelcoalition.org/wp-content/uploads/2023/09/sac-narrative-brochure.pdf](https://apparelcoalition.org/wp-content/uploads/2023/09/sac-narrative-brochure.pdf)

  [^18]: Wikipedia, The Free Encyclopedia, "Rana Plaza collapse," December 7, 2023, [https://en.wikipedia.org/wiki/Rana_Plaza_collapse](https://en.wikipedia.org/wiki/Rana_Plaza_collapse).

  [^19]: ”About : Fashion Revolution," Fashion Revolution," accessed December 7, 2023 [https://www.fashionrevolution.org/about/](https://www.fashionrevolution.org/about/).

  [^20]: "About Us - Empowering Consumers and Driving Change in Fashion", Good On You, accessed December 7, 2023, [https://partnerships.goodonyou.eco/about](https://partnerships.goodonyou.eco/about)

  [^21]: Leonie Meier, "Synthesis Report on United Nations System-wide Initiatives related to Fashion," United Nations Alliance for Sustainable Fashion, 2021, [https://unfashionalliance.org/wp-content/uploads/2021/10/UN-Fashion-Alliance-Mapping-Report_Final.pdf](https://unfashionalliance.org/wp-content/uploads/2021/10/UN-Fashion-Alliance-Mapping-Report_Final.pdf).

  [^22]: Ellen MacArthur Foundation, "A New Textiles Economy: Redesigning Fashion’s Future", 2017, [https://emf.thirdlight.com/file/24/uiwtaHvud8YIG_uiSTauTlJH74/A%20New%20Textiles%20Economy%3A%20Redesigning%20fashion’s%20future.pdf](https://emf.thirdlight.com/file/24/uiwtaHvud8YIG_uiSTauTlJH74/A%20New%20Textiles%20Economy%3A%20Redesigning%20fashion’s%20future.pdf)
  
  [^smallholding]: Smallholding. (2023, October 30). In Wikipedia. [https://en.wikipedia.org/wiki/Smallholding](https://en.wikipedia.org/wiki/Smallholding)

  [^greenwashing]: Greenwashing. (2023, November 15). In Wikipedia. [https://en.wikipedia.org/wiki/Greenwashing](https://en.wikipedia.org/wiki/Greenwashing)

  

  Euromonitor International Apparel & Footwear 2016 Edition (volume sales trends 2005–2015), [https://www.worldwildlife.org/industries/cotton](https://www.worldwildlife.org/industries/cotton)

  "Global Fashion Industry Statistics", Fashion United, accessed December 30, 2023, [https://fashionunited.com/global-fashion-industry-statistics](https://fashionunited.com/global-fashion-industry-statistics)

    https://issuu.com/fashionrevolution/docs/fashion_transparency_index_2023_pages
  https://issuu.com/fashionrevolution/docs/fashrev_consumersurvey_2020_full
  https://www.fashionrevolution.org/resources/how-tos/
  Good on You. “How We Rate Fashion Brand Ethics - Good On You,” 2023, October 6. [lihttps://goodonyou.eco/how-we-rate/nk](https://goodonyou.eco/how-we-rate/).
  Good On You. “Category: Made From - Good On You,” n.d. [https://goodonyou.eco/category/made-from/](https://goodonyou.eco/category/made-from/).
  Good On You. “Good On You Directory - Search Thousands of Fashion Brand Ratings,” n.d. [https://directory.goodonyou.eco/](https://directory.goodonyou.eco/).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/georgiakirkpatrick/veronaut-products-api.svg?style=for-the-badge
[contributors-url]: https://github.com/georgiakirkpatrick/veronaut-products-api/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/georgiakirkpatrick/veronaut-products-api.svg?style=for-the-badge
[forks-url]: https://github.com/georgiakirkpatrick/veronaut-products-api/network/members
[stars-shield]: https://img.shields.io/github/stars/georgiakirkpatrick/veronaut-products-api.svg?style=for-the-badge
[stars-url]: https://github.com/georgiakirkpatrick/veronaut-products-api/stargazers
[issues-shield]: https://img.shields.io/github/issues/georgiakirkpatrick/veronaut-products-api.svg?style=for-the-badge
[issues-url]: https://github.com/georgiakirkpatrick/veronaut-products-api/issues
[license-shield]: https://img.shields.io/github/license/georgiakirkpatrick/veronaut-products-api.svg?style=for-the-badge
[license-url]: https://github.com/georgiakirkpatrick/veronaut-products-api/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/georgia-kirkpatrick
[product-screenshot]: images/screenshot.png
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Node.js]: https://img.shields.io/badge/Node-339933?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/en
[Express-shield]: https://img.shields.io/badge/EXPRESS-000000?style=for-the-badge&logo=express
[Express-url]: https://expressjs.com
[PostgreSQL-shield]: https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org
[Mocha-shield]: https://img.shields.io/badge/Mocha-8D6748?style=for-the-badge&logo=mocha&logoColor=white
[Mocha-url]: https://mochajs.org
[Chai-shield]: https://img.shields.io/badge/Chai-A30701?style=for-the-badge&logo=chai
[Chai-url]: https://www.chaijs.com
import{u as n,c as m,r as l,j as e}from"./index-DeIu1I8V.js";import{N as p}from"./Newscard-COgjPVfT.js";import{L as g}from"./Loader-BkFEWsJ9.js";import{m as u,S as x}from"./Sponsers-Bvq_NzGs.js";const N=()=>{const{data:t,isLoading:d}=n(),{category:o}=m(s=>s.category),[a,c]=l.useState([]);return l.useEffect(()=>{if(t!=null&&t.posts){const s=o!=="general"?t.posts.filter(r=>r.category===o):t.posts;c(s)}},[o,t]),d?e.jsx(g,{}):e.jsxs(u.div,{layoutId:"underline",className:"bg-gray-600 min-h-screen pb-16",children:[e.jsx("div",{className:"pt-4 sm:m-4",children:e.jsx(x,{})}),a.length>0?e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 mt-4",children:a.map(s=>{var r,i;return e.jsx("div",{className:"bg-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300",children:e.jsx(p,{title:s.title,postId:s._id,link:`/viewfull/${s._id}`,description:s.description?s.description.slice(0,88):"No description available",pubDate:s.createdAt,sourceId:"DehatiNews",creator:s.creator?s.creator:"Ajay Sharma",imageUrl:(i=(r=s.photos)==null?void 0:r[0])==null?void 0:i.url})},s._id)})}):e.jsx("div",{className:"text-white text-center text-xl mt-10",children:"No Posts Available"})]})};export{N as default};

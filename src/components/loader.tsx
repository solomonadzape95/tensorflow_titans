const Loader = ({ resource }: { resource: string }) => {
  return (
    <div className="relative w-12 h-12 mx-auto">
      <div className="absolute w-12 h-1.5 top-[60px] left-0 bg-[#f0808050] rounded-full animate-shadow324" />
      <div className="absolute w-full h-full bg-[#f08080] rounded-md animate-jump7456" />
      Loading {resource}...
    </div>
  );
};

export default Loader;

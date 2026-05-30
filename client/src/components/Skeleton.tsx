export function Skeleton() {
  return (
    <div className="grid three">
      {[1, 2, 3].map((item) => (
        <div className="skeleton" key={item} />
      ))}
    </div>
  )
}

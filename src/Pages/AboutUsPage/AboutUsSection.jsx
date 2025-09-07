export function AboutUsSection({h3Content , pContent}) {

    return (
          <div className="about-section">
                <h3>{h3Content}</h3>
                <p>
                    {pContent}
                </p>
            </div>
    );
}
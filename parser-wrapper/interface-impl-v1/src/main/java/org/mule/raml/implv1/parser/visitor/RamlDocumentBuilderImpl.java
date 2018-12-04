/*
 * Copyright (c) MuleSoft, Inc.  All rights reserved.  http://www.mulesoft.com
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.txt file.
 */
package org.mule.raml.implv1.parser.visitor;

import org.mule.raml.implv1.model.RamlImplV1;
import org.mule.raml.interfaces.model.IRaml;
import org.mule.raml.interfaces.parser.visitor.IRamlDocumentBuilder;
import org.raml.parser.loader.*;
import org.raml.parser.visitor.RamlDocumentBuilder;

import static org.mule.raml.implv1.ParserWrapperV1.DEFAULT_RESOURCE_LOADER;

public class RamlDocumentBuilderImpl implements IRamlDocumentBuilder {

  private RamlDocumentBuilder ramlDocumentBuilder;

  public RamlDocumentBuilderImpl(ResourceLoader resourceLoader) {
    ramlDocumentBuilder = new RamlDocumentBuilder(resourceLoader);
  }

  public RamlDocumentBuilderImpl() {
    ramlDocumentBuilder = new RamlDocumentBuilder();
  }

  public IRaml build(String content, String resourceLocation) {
    return new RamlImplV1(ramlDocumentBuilder.build(content, resourceLocation), DEFAULT_RESOURCE_LOADER, resourceLocation);
  }

  public IRaml build(String resourceLocation) {
    return new RamlImplV1(ramlDocumentBuilder.build(resourceLocation), DEFAULT_RESOURCE_LOADER, resourceLocation);
  }

  public IRamlDocumentBuilder addPathLookupFirst(String path) {
    if (path != null) {
      ResourceLoader loader = ramlDocumentBuilder.getResourceLoader();
      loader = new CompositeResourceLoader(new FileResourceLoader(path), loader);
      ramlDocumentBuilder = new RamlDocumentBuilder(loader);
    }
    return this;

  }

  public IRamlDocumentBuilder addClassPathLookup(ClassLoader customClassPath) {
    ResourceLoader loader = ramlDocumentBuilder.getResourceLoader();
    loader = new CompositeResourceLoader(loader, new ClassPathResourceLoader(customClassPath));
    ramlDocumentBuilder = new RamlDocumentBuilder(loader);
    return this;
  }

  public RamlDocumentBuilderImpl getInstance() {
    return this;
  }

  public ResourceLoader getResourceLoader() {
    return ramlDocumentBuilder.getResourceLoader();
  }
}

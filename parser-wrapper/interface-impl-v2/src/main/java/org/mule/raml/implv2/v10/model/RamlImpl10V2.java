/*
 * Copyright (c) MuleSoft, Inc.  All rights reserved.  http://www.mulesoft.com
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.txt file.
 */
package org.mule.raml.implv2.v10.model;

import static java.util.Collections.emptyList;
import static java.util.Collections.emptyMap;
import static org.mule.raml.implv2.ParserV2Utils.findIncludeNodes;
import static org.mule.raml.implv2.ParserV2Utils.nullSafe;

import org.apache.commons.io.IOUtils;
import org.mule.raml.interfaces.model.IRaml;
import org.mule.raml.interfaces.model.IResource;
import org.mule.raml.interfaces.model.ISecurityScheme;
import org.mule.raml.interfaces.model.ITemplate;
import org.mule.raml.interfaces.model.parameter.IParameter;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.raml.v2.api.loader.FileResourceLoader;
import org.raml.v2.api.loader.ResourceLoader;
import org.raml.v2.api.model.v10.api.Api;
import org.raml.v2.api.model.v10.datamodel.AnyTypeDeclaration;
import org.raml.v2.api.model.v10.datamodel.ExternalTypeDeclaration;
import org.raml.v2.api.model.v10.datamodel.TypeDeclaration;
import org.raml.v2.api.model.v10.resources.Resource;
import org.raml.v2.internal.impl.RamlBuilder;
import org.raml.v2.internal.impl.v10.Raml10Builder;
import org.raml.yagi.framework.nodes.Node;

public class RamlImpl10V2 implements IRaml {

  private Api api;
  private Optional<String> version;
  private final String ramlPath;
  private final ResourceLoader resourceLoader;

  public RamlImpl10V2(Api api, ResourceLoader resourceLoader, String ramlPath) {
    this.api = api;
    this.ramlPath = ramlPath;
    this.resourceLoader = resourceLoader;
  }

  @Override
  public Map<String, IResource> getResources() {
    Map<String, IResource> map = new LinkedHashMap<>();
    List<Resource> resources = api.resources();
    for (Resource resource : resources) {
      map.put(resource.relativeUri().value(), new ResourceImpl(resource));
    }
    return map;
  }

  @Override
  public String getBaseUri() {
    return nullSafe(api.baseUri());
  }

  @Override
  public String getVersion() {
    if (version == null) {
      version = Optional.ofNullable(nullSafe(api.version()));
    }
    return version.orElse(null);
  }

  @Override
  public List<Map<String, String>> getSchemas() {
    Map<String, String> map = new LinkedHashMap<>();
    List<TypeDeclaration> types = api.types();
    if (types.isEmpty()) {
      types = api.schemas();
    }
    for (TypeDeclaration typeDeclaration : types) {
      map.put(typeDeclaration.name(), getTypeAsString(typeDeclaration));
    }
    List<Map<String, String>> result = new ArrayList<>();
    result.add(map);
    return result;
  }

  static String getTypeAsString(TypeDeclaration typeDeclaration) {
    if (typeDeclaration instanceof ExternalTypeDeclaration) {
      return ((ExternalTypeDeclaration) typeDeclaration).schemaContent();
    }
    if (typeDeclaration instanceof AnyTypeDeclaration) {
      return null;
    }
    //return non-null value in order to detect that a schema was defined
    return typeDeclaration.toJsonSchema();
  }

  @Override
  public IResource getResource(String path) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Map<String, String> getConsolidatedSchemas() {
    return emptyMap();
  }

  @Override
  public Map<String, Object> getCompiledSchemas() {
    throw new UnsupportedOperationException();
  }

  @Override
  public Map<String, IParameter> getBaseUriParameters() {
    final Map<String, IParameter> baseUriParameters = new LinkedHashMap<>();

    api.baseUriParameters().forEach(type -> baseUriParameters.put(type.name(), new ParameterImpl(type)));

    return baseUriParameters;
  }

  @Override
  public List<Map<String, ISecurityScheme>> getSecuritySchemes() {
    throw new UnsupportedOperationException();
  }

  @Override
  public List<Map<String, ITemplate>> getTraits() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getUri() {
    throw new UnsupportedOperationException();
  }

  @Override
  public Object getInstance() {
    throw new UnsupportedOperationException();
  }

  @Override
  public void cleanBaseUriParameters() {
    throw new UnsupportedOperationException();
  }

  @Override
  public List<String> getAllReferences() {
    try {
      String content = IOUtils.toString(resourceLoader.fetchResource(ramlPath));
      Node raml = new RamlBuilder().build(content);
      return findIncludeNodes(raml, ramlPath);
    } catch (IOException e) {
      e.printStackTrace();
    }
    return emptyList();
  }

  @Override
  public void injectTrait(String name) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void injectSecurityScheme(Map<String, ISecurityScheme> securityScheme) {
    throw new UnsupportedOperationException();
  }
}
